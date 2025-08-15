<#
Creates the work and release directories defined in config/paths.json
Usage (PowerShell):
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\create_dirs.ps1
Or pass custom paths:
  .\create_dirs.ps1 -WorkDir "C:\Users\Administrator\Documents\Kextra Work" -ReleaseDir "C:\Users\Administrator\Documents\Kentra App"
#>

param(
  [string]$ConfigPath = ".\config\paths.json",
  [string]$WorkDir,
  [string]$ReleaseDir
)

function Read-Json($path) {
  if (Test-Path $path) {
    Get-Content $path -Raw | ConvertFrom-Json
  } else {
    $null
  }
}

$cfg = Read-Json $ConfigPath
if (-not $cfg) { $cfg = @{} }

if ($WorkDir) { $cfg.workDir = $WorkDir }
if ($ReleaseDir) { $cfg.releaseDir = $ReleaseDir }

if (-not $cfg.workDir -or -not $cfg.releaseDir) {
  Write-Host "Using defaults if not present in config..."
  if (-not $cfg.workDir) { $cfg.workDir = "C:\\Users\\Administrator\\Documents\\Kextra Work" }
  if (-not $cfg.releaseDir) { $cfg.releaseDir = "C:\\Users\\Administrator\\Documents\\Kentra App" }
}

# Create folders
foreach ($p in @($cfg.workDir, $cfg.releaseDir)) {
  if (-not (Test-Path $p)) {
    Write-Host "Creating: $p"
    New-Item -ItemType Directory -Path $p -Force | Out-Null
  } else {
    Write-Host "Exists: $p"
  }
}

# Save updated config back
$cfg | ConvertTo-Json -Depth 4 | Set-Content $ConfigPath -Encoding UTF8
Write-Host "Updated config saved to $ConfigPath"