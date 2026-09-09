[CmdletBinding()]
param(
  [string]$BackendUrl = 'http://127.0.0.1:8001',
  [string]$FarmerId = 'demo',
  [switch]$SkipMongo,
  [switch]$SkipSeed
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backendRoot = Join-Path $repoRoot 'backend'
$backendProcess = $null
$frontendProcess = $null
$electronProcess = $null

function Wait-Backend {
  param([string]$Url)
  $healthUrl = "$Url/health"
  for ($attempt = 1; $attempt -le 30; $attempt++) {
    try {
      $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
      if ($response.farm_state -eq 'available') { return $response }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  throw "Backend did not become healthy at $healthUrl."
}

function Stop-OwnedProcess {
  param($Process)
  if ($null -ne $Process -and -not $Process.HasExited) {
    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
  }
}

try {
  Set-Location $repoRoot
  if (-not $SkipMongo) {
    try {
      docker compose -f (Join-Path $backendRoot 'docker-compose.universal-data.yml') up -d mongodb | Out-Host
    } catch {
      Write-Warning "MongoDB could not be started by Docker. Existing MongoDB or degraded reference mode will be used."
    }
  }

  if (-not $SkipSeed) {
    $env:PYTHONPATH = $backendRoot
    python (Join-Path $backendRoot 'scripts\seed_local_reference_data.py') | Out-Host
    python (Join-Path $backendRoot 'scripts\seed_demo_farmer_state.py') | Out-Host
  }

  $backendPort = ([Uri]$BackendUrl).Port
  $backendProcess = Start-Process -FilePath 'python' -ArgumentList @('-m','uvicorn','app.main:app','--host','127.0.0.1','--port',$backendPort) -WorkingDirectory $backendRoot -PassThru -WindowStyle Hidden
  $health = Wait-Backend -Url $BackendUrl
  Write-Host "Backend ready: $BackendUrl/health ($($health.status), reference $($health.reference_database))"

  $env:VITE_FARM_STATE_API_URL = $BackendUrl
  $env:VITE_REFERENCE_API_URL = $BackendUrl
  $env:VITE_DEMO_FARMER_ID = $FarmerId
  $frontendProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','dev','--','--host','127.0.0.1') -WorkingDirectory $repoRoot -PassThru -WindowStyle Hidden
  for ($attempt = 1; $attempt -le 30; $attempt++) {
    try { if ((Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -TimeoutSec 2).StatusCode -eq 200) { break } } catch { }
    Start-Sleep -Milliseconds 500
  }

  $env:KISANSATHI_BACKEND_URL = $BackendUrl
  $env:KISANSATHI_FARMER_ID = $FarmerId
  $env:ELECTRON_RENDERER_URL = 'http://127.0.0.1:5173'
  $electronProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','desktop') -WorkingDirectory $repoRoot -PassThru
  Write-Host 'KisanSathi Electron demo is running. Close Electron or press Ctrl+C to stop owned services.'
  Wait-Process -Id $electronProcess.Id
} finally {
  Stop-OwnedProcess $electronProcess
  Stop-OwnedProcess $frontendProcess
  Stop-OwnedProcess $backendProcess
}
