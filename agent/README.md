# KisanSathi MCP agent

This package exposes farmer-scoped MCP tools over local stdio. It wraps the existing FastAPI service; it does not read the frontend, SQLite files, or MongoDB directly.

## Local setup

From the repository root:

```powershell
python -m pip install -e .\agent
$env:KISANSATHI_BACKEND_URL = "http://127.0.0.1:8000"
$env:KISANSATHI_FARMER_ID = "demo"
python -m kisansathi_agent
```

The process writes MCP protocol messages to stdout and diagnostics to stderr. Start the backend first with the commands documented in `backend/README.md` or the repository setup notes.

## Codex configuration

Copy `config/codex.mcp.example.toml` into the Codex configuration and adjust the absolute `cwd` and farmer ID. The example enables automatic reads and Codex approval for the currently supported idempotent writes: irrigation records, reminders, and reports.

## Identity boundary

`KISANSATHI_FARMER_ID` is trusted launcher configuration and is sent as `X-Farmer-ID` on every backend request. It is deliberately absent from MCP tool schemas. The current backend documents this header as a temporary identity boundary, not production authentication; a production deployment must replace it with authenticated session claims.
