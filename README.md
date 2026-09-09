# KisanSathi — SIH 2026 Smart Farming Assistant

KisanSathi is a field-oriented farming assistant for SIH26180. The current MVP combines a React interface, Electron desktop companion, FastAPI services, farmer-scoped SQLite storage, a MongoDB reference catalogue, a Python MCP tool server, Sarvam language services, and an active Codex `app-server` session.

> Demo safety: marketplace, machinery, scheme, market, ML, and crop-health results may contain explicitly labelled local fixtures. They are not live availability, procurement, pesticide, irrigation, or financial guarantees. The language model never directly controls pumps, payments, or machinery.

## Start here

The fully supported demo path is **Windows PowerShell + Docker Desktop + a Windows-accessible Codex CLI**. WSL2 is recommended as the Docker Desktop backend, but the repository does not need to be run inside WSL for the Electron demo.

If the machine is already prepared, the complete startup is:

```powershell
git switch pranav
git pull --ff-only origin pranav
.\.venv\Scripts\Activate.ps1
npm ci
npm run demo:desktop
```

The launcher starts or reuses MongoDB, starts FastAPI on port `8001`, seeds safe demo records, starts Vite, opens Electron, and launches the KisanSathi MCP plugin inside Codex. Close Electron or press `Ctrl+C` in the launcher terminal to stop the processes owned by that run.

## System architecture

```text
React renderer
    │ Electron IPC
    ├─────────────── Sarvam voice/translation ──┐
    │                                            │
    ▼                                            ▼
Codex app-server ── KisanSathi MCP ── FastAPI backend
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
               farmer-specific SQLite              shared MongoDB catalogue
                         │
                         └── IoT observations / local ML inference
```

Codex is currently required only for the conversational agent path. Manual farm screens and backend APIs continue to work when Codex or Sarvam is unavailable.

## Required software

Install these on the Windows host used to launch Electron:

| Requirement | Supported baseline | Check |
|---|---|---|
| Windows | Windows 10/11, 64-bit | `winver` |
| Git | Current Git for Windows | `git --version` |
| Node.js | Node 22 LTS | `node --version` |
| npm | Bundled with Node | `npm --version` |
| Python | Python 3.11 or 3.12, 64-bit | `py -0p` |
| Docker Desktop | Current release, Linux containers | `docker version` |
| Docker Compose | Compose v2 | `docker compose version` |
| Codex CLI | Current authenticated CLI on Windows `PATH` | `codex --version` |

Node 22 is recommended because Electron and the current frontend toolchain require a modern Node runtime. The Python MCP package requires Python 3.11 or later.

### WSL2 and Docker Desktop

WSL is not required to execute the Windows Electron launcher, but Docker Desktop normally uses WSL2 for Linux containers.

Open **PowerShell as Administrator**:

```powershell
wsl --install
wsl --update
```

Restart Windows if requested. Then:

1. Install Docker Desktop.
2. Open Docker Desktop settings.
3. Enable **Use the WSL 2 based engine**.
4. Switch Docker to Linux containers if it is in Windows-container mode.
5. Wait until Docker Desktop reports that the engine is running.

Verify from ordinary PowerShell:

```powershell
wsl --status
docker version
docker compose version
docker run --rm hello-world
```

OpenAI's WSL guidance recommends WSL2 and keeping Linux-run repositories under the Linux home directory rather than `/mnt/c` when Codex itself is being used inside WSL. For this project's supported Electron path, keep the clone on Windows and make `codex.exe` available to Windows PowerShell: <https://learn.chatgpt.com/docs/windows/wsl>.

### Install and activate Codex

Follow the current official Codex CLI setup for the teammate's platform: <https://learn.chatgpt.com/docs/codex/cli>.

After installation, open a new PowerShell window and run:

```powershell
Get-Command codex
codex --version
codex
```

On first launch, choose **Sign in with ChatGPT** or another available authentication method. Exit the interactive session after sign-in, then verify again:

```powershell
codex --version
```

The Electron process launches `codex app-server --stdio`. Installing Codex only inside WSL is not sufficient for the default Windows launcher. If Codex is installed at a nonstandard Windows path, set it for the current terminal before starting the demo:

```powershell
$env:CODEX_BINARY = "C:\path\to\codex.exe"
```

Do not commit Codex credentials, ChatGPT session files, or API keys.

## Clone the correct branch

```powershell
git clone https://github.com/errorlord-404/sih-mvp.git
Set-Location "sih-mvp"
git fetch origin
git switch pranav
git pull --ff-only origin pranav
```

Confirm:

```powershell
git branch --show-current
git status --short
```

The branch name must be `pranav`. A clean initial clone should have no `git status --short` output.

## Install project dependencies

### 1. Python environment

From the repository root:

```powershell
py -3.11 -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r .\backend\requirements.txt
python -m pip install -e .\agent
```

The terminal running `npm run demo:desktop` must have this virtual environment activated. The launcher and the Codex MCP plugin both resolve `python` from that environment.

Local ML inference is optional and substantially larger:

```powershell
python -m pip install -r .\backend\requirements-ml.txt
```

Do not install the ML requirements for the normal UI/backend demo unless the machine will run the controlled TFLite demonstration.

### 2. JavaScript and Electron dependencies

```powershell
npm ci
```

If Electron installation is interrupted by antivirus or network policy, remove only `node_modules` on the teammate's own clone and run `npm ci` again. Never commit `node_modules`.

### 3. Backend environment

Create a local environment file:

```powershell
Copy-Item .\backend\.env.example .\backend\.env -ErrorAction SilentlyContinue
```

The checked-in example is safe. Real secrets belong only in `backend/.env`, which is ignored by Git.

For the standard demo, the defaults are enough. Optional services:

- Set `SARVAM_API_KEY` and `VOICE_PROVIDER=sarvam` for transcription, translation, and speech.
- Set unique `SCRAPER_WEBHOOK_TOKEN` and `N8N_ENCRYPTION_KEY` only when running n8n.
- Keep `DIAGNOSIS_PROVIDER=unconfigured` unless an approved local model and its release manifest are available.

Never paste a real key into `.env.example`, React source, screenshots, issues, or commits.

## Preflight checklist

Run every command from the repository root in the same PowerShell terminal:

```powershell
git branch --show-current
node --version
npm --version
python --version
python -c "import fastapi, beanie, mcp; print('Python dependencies OK')"
docker version
docker compose version
codex --version
```

Expected conditions:

- Branch is `pranav`.
- Node is 22.x or newer compatible runtime.
- Python is 3.11 or 3.12.
- Docker client and server both respond.
- The Python dependency command prints `Python dependencies OK`.
- `codex --version` succeeds without asking for an installation.

## Run the complete Electron prototype

Activate the virtual environment and start the launcher:

```powershell
.\.venv\Scripts\Activate.ps1
npm run demo:desktop
```

The first run may take longer while Docker downloads MongoDB and npm/Electron verifies binaries.

The expected terminal sequence includes:

```text
Backend ready: http://127.0.0.1:8001/health
KisanSathi Electron demo is running.
```

Inside Electron:

1. Open **Settings**.
2. Confirm the backend and reference database are available.
3. Open **Ask KisanSathi** or **Voice assistant**.
4. Confirm `Codex app-server` and `KisanSathi plugin` are connected.
5. Select a field before asking field-specific questions.
6. Try: `Show my fields and tell me whether any field needs irrigation attention.`
7. Approve a write only after the UI shows the exact proposed change.

Use a clean, deterministic demo dataset when necessary:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-demo.ps1 -ResetDemo
```

`-ResetDemo` is deliberately limited to the selected demo farmer and labelled demo catalogue records.

## Verify the running system

While the backend is running at the default demo URL, open another PowerShell terminal:

```powershell
npm run demo:check
npm run demo:contracts
Invoke-RestMethod http://127.0.0.1:8001/health
Invoke-RestMethod http://127.0.0.1:8001/v1/diagnostics -Headers @{ 'X-Farmer-ID' = 'demo' }
```

Useful local URLs:

| Service | URL |
|---|---|
| Vite renderer | `http://127.0.0.1:5173` or the next free port |
| FastAPI health | `http://127.0.0.1:8001/health` |
| FastAPI OpenAPI | `http://127.0.0.1:8001/docs` |
| MongoDB | `mongodb://127.0.0.1:27017` |
| n8n, optional | `http://127.0.0.1:5678` |

## Run quality checks before pushing

```powershell
npm run lint
npm run build
npm run test:ui
npm run test:desktop
python -m pytest .\backend\tests -q
python -m pytest .\agent\tests -q
npm run demo:contracts
```

Local ML tests are optional and require the larger ML dependency set and appropriate artifacts.

## Optional manual startup

Use this only when debugging an individual service.

Start MongoDB:

```powershell
docker compose -f .\backend\docker-compose.universal-data.yml up -d mongodb
```

Start FastAPI:

```powershell
.\.venv\Scripts\Activate.ps1
Set-Location .\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

In a second terminal, start the renderer from the repository root:

```powershell
$env:VITE_FARM_STATE_API_URL = "http://127.0.0.1:8001"
$env:VITE_REFERENCE_API_URL = "http://127.0.0.1:8001"
npm run dev -- --host 127.0.0.1
```

For the active Codex integration, prefer `npm run demo:desktop`; it injects the KisanSathi MCP server into the private Codex session automatically.

## Troubleshooting

### Electron says `Codex app-server` is unavailable

```powershell
Get-Command codex
codex --version
codex
```

Complete sign-in in the same Windows account that launches Electron. Restart PowerShell after installing Codex. If needed, set `CODEX_BINARY` to the full Windows executable path.

### The plugin is missing or will not start

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -e .\agent
$env:KISANSATHI_BACKEND_URL = "http://127.0.0.1:8001"
$env:KISANSATHI_FARMER_ID = "demo"
python .\codex\plugins\kisansathi\run_server.py
```

The last command starts an MCP stdio process and waits silently for protocol input; press `Ctrl+C` after confirming that it does not exit with an import error.

### Backend or schemes show unavailable

```powershell
docker compose -f .\backend\docker-compose.universal-data.yml ps
Invoke-RestMethod http://127.0.0.1:8001/health
npm run demo:check
```

If MongoDB is still starting, wait for its health check and retry. The farmer SQLite functions can remain available while the shared reference database is degraded.

### Port 8001 is occupied

Inspect the owner instead of killing unrelated processes:

```powershell
Get-NetTCPConnection -LocalPort 8001 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
```

Then use a free backend URL:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-demo.ps1 -BackendUrl http://127.0.0.1:8020
```

### PowerShell blocks virtual-environment activation

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Docker cannot start MongoDB

Confirm Docker Desktop is running in Linux-container mode, then run:

```powershell
wsl --update
wsl --shutdown
```

Restart Docker Desktop and retry the MongoDB compose command.

### Maps are blank

Leaflet map tiles require network access. Switch to **List View** for the same stored field and provider records when tiles are unavailable.

## Repository map

```text
src/                 React renderer and manual farmer workflows
desktop/             Electron main process, preload bridge, Codex client
backend/             FastAPI, SQLite farmer state, MongoDB references, IoT and ML services
agent/               Farmer-scoped Python MCP tools
codex/plugins/       Portable KisanSathi MCP plugin launcher
ml/                  Model contracts, training/evaluation scripts and release manifests
scripts/             One-command demo, diagnostics and contract checks
docs/sih26180/       Research, decisions, implementation plans and handoff checkpoints
output/              Generated presentation diagrams
```

The large `codex/codex-rs` tree is retained as research/reference history. The present demo does not build that Rust fork; it launches the installed Codex CLI and injects the Python KisanSathi MCP server.

## Team rules

- Create focused commits and pull the latest `pranav` branch before starting work.
- Do not commit `.env`, SQLite databases, MongoDB data, downloaded datasets, model weights, logs, `node_modules`, or Electron build output.
- Preserve source, timestamp, freshness, uncertainty, and demo labels in farmer-facing results.
- Never silently substitute fixture data for live data.
- Never allow an LLM to directly control irrigation hardware, machinery, payments, or pesticide dosage.
- Persistent writes require explicit farmer confirmation and must be auditable.
- Read `backend/AGENTS.md` before changing backend contracts.

## Project references

- [MVP implementation checkpoint](docs/sih26180/MVP_IMPLEMENTATION_CHECKPOINT_2026_09_09.md)
- [Initial-demo readiness plan](docs/sih26180/MVP_INITIAL_DEMO_READINESS_PLAN_2026_09_09.md)
- [Codex integration status](docs/sih26180/PRANAV_CODEX_INTEGRATION_STATUS.md)
- [MCP agent plan](MCP_AGENT_IMPLEMENTATION_PLAN.md)
- [ML model decision record](ml/MODEL_DECISION_RECORD.md)
- [Desktop harness notes](desktop/README.md)
- [Backend change log](backend/ChangeLog.md)
