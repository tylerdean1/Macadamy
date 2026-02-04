param(
  [Parameter(Mandatory = $true)]
  [string]$Root
)

$rootFull = (Resolve-Path -Path $Root).Path

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
Write-Host "[audit] Scanning files..."
$files = Get-ChildItem -Path $rootFull -Recurse -Force -File -ErrorAction SilentlyContinue
$totalCount = $files.Count
$totalBytes = 0
Write-Host "[audit] Files found: $totalCount"

Write-Host "[audit] Computing totals, directory sizes, and building file list..."
$dirSizes = @{}
$fileList = New-Object System.Collections.Generic.List[object]
$i = 0
foreach ($file in $files) {
  $i++
  if ($i % 5000 -eq 0) {
    Write-Progress -Activity "Processing files" -Status "$i / $totalCount" -PercentComplete (($i / $totalCount) * 100)
  }

  $relFile = $file.FullName.Substring($rootFull.Length + 1) -replace '\\','/'
  $size = [int64]$file.Length
  $totalBytes += $size
  $fileList.Add([PSCustomObject]@{ Path = $relFile; Size = $size })

  $dir = (Split-Path -Parent $relFile) -replace '\\','/'
  while ($dir -and $dir -ne ".") {
    if (-not $dirSizes.ContainsKey($dir)) {
      $dirSizes[$dir] = [int64]0
    }
    $dirSizes[$dir] += $size
    $dir = (Split-Path -Parent $dir) -replace '\\','/'
  }
}
Write-Progress -Activity "Processing files" -Completed
Write-Host "[audit] Total bytes: $totalBytes"

Write-Host "[audit] Computing top 25 files..."
$topFiles = $files | Sort-Object -Property Length -Descending | Select-Object -First 25 | ForEach-Object {
  [PSCustomObject]@{
    Path = ($_.FullName.Substring($rootFull.Length + 1) -replace '\\','/')
    Size = $_.Length
  }
}

$topDirs = $dirSizes.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 25 | ForEach-Object {
  [PSCustomObject]@{
    Path = $_.Key
    Size = $_.Value
  }
}

Write-Host "[audit] Building markdown output..."
$lines = @()
$lines += "# publicOG File Checklist (Phase 1)"
$lines += ""
$lines += "Total files count: $totalCount"
$lines += "Total size of publicOG: $totalBytes bytes"
$lines += ""
$lines += "Top 25 largest files:"
foreach ($item in $topFiles) {
  $lines += "- $($item.Size) - $($item.Path)"
}
$lines += ""
$lines += "Top 25 largest directories by total size:"
foreach ($item in $topDirs) {
  $lines += "- $($item.Size) - $($item.Path)"
}
$lines += ""
$lines += "## File Checklist"
$lines += ""

$sortedFiles = $fileList | Sort-Object -Property Path
foreach ($file in $sortedFiles) {
  $lines += "- [ ] $($file.Path) — $($file.Size)"
}

$outPath = Join-Path $rootFull "site_audit_files.md"
$lines | Set-Content -Path $outPath -Encoding UTF8

$stopwatch.Stop()
Write-Host "[audit] Wrote $outPath"
Write-Host "[audit] Done in $($stopwatch.Elapsed.ToString())"
