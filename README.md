# AD Arsenal

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**A searchable, variable-driven reference for Active Directory attacks** — copy-paste commands, a BloodHound edge → exploitation lookup, multi-hop attack chains modeled as trees, and a "why/how it works" learnbook, all in one fast, offline-friendly, single-page app.

Built for authorized penetration testing, red team engagements, and AD security education. Every entry links back to the real tool's GitHub repository so nothing here is a black box.

> ⚠️ **For authorized security testing and education only.** Do not use against systems you don't have explicit written permission to test.

### 🌐 [ad-arsenal.gh0ulh4x.workers.dev](https://ad-arsenal.gh0ulh4x.workers.dev/)

No install needed — the live site is always up to date with `main`.

---

## Why this exists

Most AD attack cheat-sheets are static wiki pages: you copy a command, then hand-edit five placeholders before it actually runs. AD Arsenal instead treats the whole reference as structured data with **live variable substitution** — set `$TARGET`, `$DOMAIN`, `$USER`, `$HASH`, etc. once in the side panel, and every command across the entire app (Commands, Attack Paths, Attack Chains) updates and copies ready-to-run, correctly quoted for bash or Windows depending on the tool.

## Features

- **Commands reference (430+ entries)** — recon, credential access, lateral movement, C2 frameworks, privilege escalation, persistence, and defense evasion, each with a description and a concrete use case, not just a bare command.
- **Live variable substitution** — fill in your engagement's values once; every command reflects it instantly, with correct bash (`'...'`, `!`-safe) or Windows quoting auto-detected per tool.
- **Dual command variants** — tools with more than one real-world invocation (Impacket's `secretsdump.py` vs. `impacket-secretsdump`, `certipy` vs. `certipy-ad`, `bloodyAD` vs. `bloodyad`) show both automatically, no duplicate entries to maintain.
- **Attack Paths (59+ edges)** — a BloodHound edge name → concrete exploitation steps lookup, covering the full ACL/ADCS/delegation/credential-read surface including the complete ADCS ESC1–ESC16 tree.
- **Attack Chains (50+ trees)** — multi-hop, BloodHound-style exploitation paths rendered as real trees (`├──`/`└──` connectors), showing how individual primitives chain into full domain compromise.
- **Learnbook (47+ topics)** — mechanism explanations (why/how/effect/detection/remediation) for the techniques, separate from the copy-paste commands, for when you need to explain *why* something works, not just run it.
- **CVE tracker (10+ tracked)** — recent AD-relevant CVEs cross-linked to their related commands and mechanism write-ups.
- **Global search** — one search box across commands, attack paths, chains, learnbook, and CVEs at once.
- **Every tool links to its real GitHub repo** — click the tool name on any command to verify you're running the genuine, community-audited source.
- **Light/dark theme**, keyboard-friendly, and works fully offline once built — no backend, no telemetry, no external calls at runtime.

## Project structure

```
src/
  App.jsx        Everything: UI components, PHASES/ENTRIES (the command reference),
                 EDGE_CATEGORIES/EDGES (BloodHound edge lookup), CHAINS (attack-chain
                 trees), LEARN_CATEGORIES/LEARN (mechanism write-ups), CVES, the
                 GitHub-link resolver, and the top-level ADArsenal component tying
                 the Commands / Attack Paths / Attack Chains / Learnbook / CVEs tabs
                 together.
  main.jsx       React entry point.
  index.css      Tailwind entry point.
```

The whole app intentionally lives in one file — `App.jsx` — rather than being split into `data/*.js` + `utils/*.js` modules. This keeps every command, edge, chain, and learnbook entry co-located and trivially `Ctrl+F`-able, at the cost of the file being large. If you're adding a handful of new entries, this is fine; if you're planning a bulk import (see below), consider whether a build-time merge step is worth introducing.

> **Note for contributors:** `src/data/` and `src/utils/` contain unused files left over from an earlier, modular version of the codebase (before everything was consolidated into `App.jsx`). They are not imported anywhere. Removing them is a good first issue if you'd like to send a small, low-risk PR.

## Tech stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- No backend, no database, no build-time network calls — everything is static data shipped in the bundle.

## Running it locally (for contributors)

The live site above is the fastest way to *use* AD Arsenal — this is only needed if you're contributing:

Requires [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/Gh0ulH4x/AD-arsenal.git
cd AD-arsenal
npm install
npm run dev
```

Opens at `http://localhost:5173`. `npm run build` produces a static `dist/` bundle.

## Contributing

Contributions are very welcome — new commands, corrected syntax, additional attack chains, missing tools, or just fixing a stale flag. This is a living reference and AD tooling moves fast.

### Adding a command

Add an object to the `ENTRIES` array in `src/App.jsx`:

```js
{
  id: "unique-kebab-case-id",
  tool: "Tool Name",              // shown under the title; auto-linked to GitHub if
                                   // it's in TOOL_REPOS or resolved by repoFor()
  phase: "recon",                 // one of PHASES: recon, cred, lateral, pivot, c2,
                                   // privesc, persist, evasion
  title: "What this command does",
  command: "tool.exe -target $TARGET -user $USER",  // use $VARS from the VARS array
  description: "What it does and why, one or two sentences.",
  useCase: "When you'd actually reach for this.",
}
```

A few things worth knowing before you open a PR:

- **Variable convention:** reuse the existing `$TARGET`/`$DC`/`$DOMAIN`/`$USER`/`$PASS`/`$HASH`/`$SID`/`$OUTFILE`/`$ATTACKER`/`$TARGETOBJECT`/`$INTERFACE` tokens rather than inventing new ones where an existing one fits.
- **Windows vs. bash quoting:** `shellOf()` infers this from a hardcoded tool-name list (`winTools`). If you add a Windows-only tool (a `.exe`, a PowerShell cmdlet), add its name to that list — otherwise its commands get bash-escaped incorrectly.
- **Impacket dual-variants:** if your command is a real Impacket example script (`something.py`), add its basename to `IMPACKET_SCRIPT_NAMES` so it automatically gets the `impacket-*` package-binary variant shown alongside it. Don't add tools that merely happen to be invoked as `name.py` but aren't part of Impacket — that list exists specifically to avoid suggesting a fake `impacket-*` binary for unrelated tools.
- **GitHub links:** add your tool to the `TOOL_REPOS` map (or extend `repoFor()` for a grouped family like Impacket/GTFOBins/PKINITtools) with a real, verified repository URL. Never guess a URL — if you're not sure a tool has a public repo, leave it unmapped rather than linking something wrong.
- **No fabricated commands:** if a technique's public tooling doesn't exist yet or you're not fully certain of exact flags, say so in the description rather than inventing plausible-looking syntax.

### Adding an Attack Path (BloodHound edge)

Add an object to `EDGES`:

```js
{
  id: "EdgeName",
  name: "Human-readable edge name",
  target: "What kind of object this targets",
  category: "acl",   // see EDGE_CATEGORIES: acl, credread, deleg, local, gpo, adcs, info
  grants: "What holding this edge actually lets you do.",
  steps: ["command one", "command two"],   // rendered in order, bash-quoted
  impact: "The end result once you've exploited it.",
}
```

### Adding an Attack Chain

Attack Chains model multi-hop paths as a tree under `CHAINS`. Each `root` node can have `children`, and `ChainNode` computes the `├──`/`└──` tree connectors automatically — you don't hand-draw them:

```js
{
  id: "chain-id",
  title: "Starting Point → Middle Step → Payoff",
  category: "credread",
  summary: "One or two sentences on why this chain matters.",
  root: {
    label: "Starting primitive",
    edgeId: "SomeEdge",   // optional: cross-reference an EDGES entry
    command: "optional command for this step",
    children: [
      { label: "Next step", command: "...", children: [ /* ... */ ] },
    ],
  },
}
```

### Adding a Learnbook entry

Add an object to `LEARN` with `category`, `title`, `why`, `body`, `effect`, and optionally `detection`/`remediation`.

### Before opening a PR

1. `npm run build` — must complete with no errors.
2. `npm run dev` and manually verify your new entries in the browser: search for them, check the command renders correctly (right quoting, variables substitute cleanly), and confirm tree connectors render correctly if you added a chain.
3. Keep PRs focused — a handful of related entries (e.g. "add Rubeus diamond/sapphire ticket variants") is easier to review than a sweeping, unrelated batch.

## Known limitations / good first issues

- `src/data/` and `src/utils/` are unused legacy files — safe to delete (see note above).
- The variable panel is in-memory only and resets on reload — wiring it to `localStorage` would help.
- No automated test suite yet. `substitute()`/`bashQuote()`/`getCommandVariants()` are the highest-value functions to cover, since subtly wrong quoting (e.g. `!` triggering bash history expansion) is easy to reintroduce silently.
- The app is a single ~500KB JS bundle — code-splitting by tab (Commands / Attack Paths / Learnbook) would improve initial load on slower connections.

## Disclaimer

This project is a reference for techniques used in **authorized** penetration testing, red team engagements, and security research. You are responsible for ensuring you have explicit permission before testing any system. The maintainers are not responsible for misuse.

## License

[MIT](LICENSE)

## Acknowledgments

AD Arsenal exists because of the public research and tooling from the AD security community — Impacket, BloodHound/SharpHound, GhostPack (Rubeus, Certify, SharpDPAPI, SafetyKatz), Certipy, Mimikatz, NetExec, and dozens of individual researchers and tool authors whose work is linked directly from every relevant entry in the app.
