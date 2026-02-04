# Run: powershell -ExecutionPolicy Bypass -File scripts/audit_prefix_summary.ps1
# START: scripts/audit_prefix_summary.ps1
$root = "c:\Users\tyler\OneDrive\Desktop\Macadamy\publicOG"
$path = Join-Path $root "site_audit_files.md"


# Parse BOTH unchecked and checked entries:
# Expected line format: - [ ] relative/path — 123
# or:               - [x] relative/path — 123
$emdash = [char]0x2014
$pattern = "^\s*-\s*\[(?<chk>[ xX])\]\s+(?<p>.+?)\s+$emdash\s+(?<s>\d+)\s*$"


$items = Get-Content -LiteralPath $path -ErrorAction Stop |
  ForEach-Object {
    $m = [regex]::Match($_, $pattern)
    if ($m.Success) {
      [PSCustomObject]@{
        Path    = $m.Groups["p"].Value
        Size    = [int64]$m.Groups["s"].Value
        Checked = ($m.Groups["chk"].Value -match '[xX]')
      }
    }
  } | Where-Object { $_ -ne $null }


$prefixes = @(
  ".git/objects/",
  ".git/",
  "node_modules/",
  "dist/",
  "build/",
  ".vite/",
  ".next/",
  "coverage/",
  "supabase/",
  "src/",
  "scripts/"
)


"PREFIX SUMMARY (derived from site_audit_files.md)"
"Total items parsed: $($items.Count)"
""


foreach ($p in $prefixes) {
  $subset = $items | Where-Object { $_.Path.StartsWith($p) }
  if ($subset.Count -gt 0) {
    $count = $subset.Count
    $bytes = ($subset | Measure-Object -Property Size -Sum).Sum
    $checked = ($subset | Where-Object { $_.Checked }).Count
    $unchecked = $count - $checked
    "{0}  files={1}  checked={2}  unchecked={3}  bytes={4}" -f $p, $count, $checked, $unchecked, $bytes
  } else {
    "{0}  files=0  checked=0  unchecked=0  bytes=0" -f $p
  }
}


# Optional: show top 15 largest files overall
""
"TOP 15 LARGEST FILES (overall)"
$items |
  Sort-Object Size -Descending |
  Select-Object -First 15 |
  ForEach-Object { "{0}`t{1}" -f $_.Size, $_.Path }
# END: scripts/audit_prefix_summary.ps1
