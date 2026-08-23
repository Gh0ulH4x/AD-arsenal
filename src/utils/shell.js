// Variable slots editable in the top panel, in display order.
// key = token that appears in commands as $KEY, placeholder = shown in the input when empty.
export const VARS = [
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
];

// Which shell dialect a command runs in, inferred from the tool/command —
// determines how filled-in variable values get quoted so special characters
// (like ! in a password) can't break the command or trigger bash history expansion.
export function shellOf(entry) {
  const winTools = [
    "Rubeus", "Mimikatz", "PowerShell", "SharpHound", "SpoolSample", "reg /",
    "PingCastle", "ADRecon", "Group3r", "Snaffler", "nltest", "klist", "LaZagne",
    "comsvcs.dll", "DSInternals", "ntdsutil", "DomainPasswordSpray", "Certify",
    "Whisker", "SharpGPOAbuse", "LAPSToolkit", "Get-LapsADPassword", "Windows PrivEsc",
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
export function bashQuote(value) {
  let out = "'";
  for (const ch of value) {
    if (ch === "'") out += `'\\''`;
    else if (ch === "!") out += `'\\!'`;
    else out += ch;
  }
  out += "'";
  return out;
}

// For Impacket entries, scripts can be invoked either as the raw .py file
// (git clone install) or as the impacket-<Name> wrapper binary (apt/pipx
// package install). Derive the second form from the first automatically.
export function impacketAlt(command) {
  const match = command.match(/^([A-Za-z0-9]+)\.py\b/);
  if (!match) return null;
  return command.replace(/^([A-Za-z0-9]+)\.py\b/, `impacket-${match[1]}`);
}

// Replace $KEY tokens with live values. Sorted longest-key-first so $TARGET
// never eats into $TARGETOBJECT.
export function substitute(command, values, shell) {
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
