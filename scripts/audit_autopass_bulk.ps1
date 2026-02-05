# Run: powershell -ExecutionPolicy Bypass -File scripts/audit_autopass_bulk.ps1 -Root "c:\Users\tyler\OneDrive\Desktop\Macadamy\publicOG" -BatchSize 25
param(
  [Parameter(Mandatory = $true)]
  [string]$Root,
  [int]$BatchSize = 25
)

$rootFull = (Resolve-Path -Path $Root).Path
$checklistPath = Join-Path $rootFull "site_audit_files.md"
$notesPath = Join-Path $rootFull "site_audit_notes.md"
$auditPath = Join-Path $rootFull "site_audit.md"

$emdash = [char]0x2014
$pattern = "^\s*-\s*\[(?<chk>[ xX])\]\s+(?<p>.+?)\s+$emdash\s+(?<s>\d+)\s*$"

$bulkPrefixes = @(
  ".git/objects/",
  ".git/",
  "node_modules/",
  "dist/",
  "build/",
  ".vite/",
  ".next/",
  "coverage/"
)

function Test-AnyPrefix {
  param(
    [string]$RelPath,
    [string[]]$Prefixes
  )
  foreach ($p in $Prefixes) {
    if ($RelPath.StartsWith($p)) {
      return $true
    }
  }
  return $false
}

function Get-BulkPrefixHit {
  param(
    [string]$RelPath,
    [string[]]$Prefixes
  )
  foreach ($p in $Prefixes) {
    if ($RelPath.StartsWith($p)) {
      return $p
    }
  }
  return ""
}

function Test-DeepNoteTarget {
  param(
    [string]$RelPath
  )
  if ($RelPath.StartsWith("src/")) { return $true }
  if ($RelPath.StartsWith("scripts/")) { return $true }
  if ($RelPath.StartsWith("supabase/")) { return $true }

  if ($RelPath -notmatch "/") {
    if ($RelPath -match "^package(\.json|-lock\.json)$") { return $true }
    if ($RelPath -match "^tsconfig.*\.json$") { return $true }
    if ($RelPath -match "^vite\.config\.(ts|js)$") { return $true }
    if ($RelPath -match "^eslint.*") { return $true }
    if ($RelPath -match "^postcss.*") { return $true }
    if ($RelPath -match "^tailwind.*") { return $true }
    if ($RelPath -match "^vercel\.json$") { return $true }
    if ($RelPath -match "^(README\.md|AGENTS\.md|index\.html)$") { return $true }
  }

  return $false
}

$batchNumber = 0

while ($true) {
  $lines = Get-Content -LiteralPath $checklistPath -ErrorAction Stop
  $entries = New-Object System.Collections.Generic.List[object]

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $m = [regex]::Match($line, $pattern)
    if ($m.Success) {
      $entries.Add([PSCustomObject]@{
          LineIndex = $i
          RelPath   = $m.Groups["p"].Value
          Size      = [int64]$m.Groups["s"].Value
          Checked   = ($m.Groups["chk"].Value -match '[xX]')
        })
    }
  }

  $unchecked = $entries | Where-Object { -not $_.Checked }
  if ($unchecked.Count -eq 0) {
    Write-Host "Autopass finished."
    break
  }

  $batch = $unchecked | Select-Object -First $BatchSize
  $batchNumber++

  $startPath = $batch[0].RelPath
  $endPath = $batch[$batch.Count - 1].RelPath
  $batchBytes = ($batch | Measure-Object -Property Size -Sum).Sum

  $batchPrefixes = $batch | ForEach-Object { Get-BulkPrefixHit -RelPath $_.RelPath -Prefixes $bulkPrefixes } | Where-Object { $_ -ne "" } | Select-Object -Unique
  $allBulk = ($batch | Where-Object { -not (Test-AnyPrefix -RelPath $_.RelPath -Prefixes $bulkPrefixes) }).Count -eq 0
  $singleBulkPrefix = $allBulk -and ($batchPrefixes.Count -eq 1)

  @(
    "### Batch $batchNumber",
    "- Start: $startPath",
    "- End: $endPath",
    "- Count: $($batch.Count)",
    "- Bytes: $batchBytes"
  ) | Out-File -FilePath $notesPath -Append -Encoding utf8

  if ($singleBulkPrefix) {
    $prefixHit = $batchPrefixes | Select-Object -First 1
    @(
      "- Bulk-accounted prefix: $prefixHit",
      "- Conclusion: do NOT write per-file notes here. These are generated/system artifacts.",
      "- Commit guidance:",
      "  - node_modules/: should exist locally, should NOT be committed.",
      "  - dist/build/.vite/.next/coverage: usually NOT committed; regenerate via build.",
      "  - .git/: only valid if publicOG is the repo root; otherwise likely accidental nested repo.",
      ""
    ) | Out-File -FilePath $notesPath -Append -Encoding utf8
  }
  else {
    $bulkItems = $batch | Where-Object { Test-AnyPrefix -RelPath $_.RelPath -Prefixes $bulkPrefixes }
    $deepItems = $batch | Where-Object { -not (Test-AnyPrefix -RelPath $_.RelPath -Prefixes $bulkPrefixes) }

    if ($bulkItems.Count -gt 0) {
      $bulkBytes = ($bulkItems | Measure-Object -Property Size -Sum).Sum
      @(
        "- Bulk subset: $($bulkItems.Count) files, $bulkBytes bytes",
        "- Bulk conclusion: accounted for without per-file notes (generated/system).",
        ""
      ) | Out-File -FilePath $notesPath -Append -Encoding utf8
    }

    foreach ($item in $deepItems) {
      $abs = Join-Path $rootFull $item.RelPath
      $exists = Test-Path -LiteralPath $abs
      $lastWrite = $null
      if ($exists) {
        $fi = Get-Item -LiteralPath $abs -ErrorAction SilentlyContinue
        if ($null -ne $fi) {
          $lastWrite = $fi.LastWriteTimeUtc.ToString("o")
        }
      }

      if (Test-DeepNoteTarget -RelPath $item.RelPath) {
        @(
          "#### $($item.RelPath)",
          "- Exists: $exists",
          "- Size: $($item.Size)",
          "- LastWriteTimeUtc: $lastWrite",
          "- Notes: (write real audit notes here if you want to expand later)",
          ""
        ) | Out-File -FilePath $notesPath -Append -Encoding utf8
      }
      else {
        @(
          "#### $($item.RelPath)",
          "- Exists: $exists",
          "- Size: $($item.Size)",
          "- Notes: accounted (non-core file; no deep note)",
          ""
        ) | Out-File -FilePath $notesPath -Append -Encoding utf8
      }
    }
  }

  foreach ($item in $batch) {
    $idx = $item.LineIndex
    $lines[$idx] = $lines[$idx] -replace '\[ \]', '[x]'
  }

  $tmpChecklist = "$checklistPath.tmp"
  $lines | Set-Content -LiteralPath $tmpChecklist -Encoding utf8
  Move-Item -LiteralPath $tmpChecklist -Destination $checklistPath -Force

  $remaining = ($entries | Where-Object { -not $_.Checked } | Select-Object -First 1)
  $nextPath = if ($null -ne $remaining) { $remaining.RelPath } else { "(none)" }

  "- Batch ${batchNumber}: $startPath → $endPath | next: $nextPath" |
  Out-File -FilePath $auditPath -Append -Encoding utf8

  Write-Host "Completed batch $batchNumber. Next: $nextPath"
}

Write-Host "Autopass finished."
