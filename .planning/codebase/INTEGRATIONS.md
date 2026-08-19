# External Integrations

**Analysis Date:** 2026-08-16

## APIs & External Services

**Current runtime services:**
- MongoDB - central shared reference-data store accessed by the backend.
  - SDK/Client: `motor==3.7.1`, `pymongo==4.17.0`, and `beanie==2.0.0` in `backend/requirements.txt`.
  - Auth: connection URI supplied through `MONGODB_URL` in `backend/app/core/config.py`.

**Internal API surface:**
- FastAPI REST service - publishes CRUD endpoints for crops, diseases, farmers, fertilizers, market prices, government schemes, MSP records, and seeds from `backend/app/main.py` and `backend/app/routers/`.
  - SDK/Client: FastAPI 0.141.1.
  - Auth: None; `backend/app/main.py` registers no authentication dependency or middleware.
- Codex CLI tool integration - `backend/docs/PRD.md` defines the intended flow: backend REST/internal API → Rust tool handler → Codex tool registry. The embedded fork is located at `codex/codex-rs/`.
  - SDK/Client: no HTTP client or KisanSathi-specific handler is implemented in `codex/`.
  - Auth: Not applicable in current code.

**Planned-but-unimplemented source integrations:**
- Weather, market/mandi, MSP, government schemes, IoT sensors, and Sarvam-or-equivalent language services are requirements in `backend/docs/PRD.md`; no service client, credential setting, or outbound request exists in `backend/app/`.
- Apify Actor and n8n - not detected in manifests, configuration, imports, workflow files, or backend routes. Current `POST /market-prices`, `POST /msp`, and `POST /gov-schemes` endpoints in `backend/app/routers/market_price.py`, `backend/app/routers/msp.py`, and `backend/app/routers/gov_scheme.py` are the existing persistence entry points an authenticated ingestion workflow could invoke. The current implementation has no source provenance fields, idempotency key, bulk-ingestion endpoint, or ingestion-job status model.

## Data Storage

**Databases:**
- MongoDB central database.
  - Connection: `MONGODB_URL` and `DATABASE_NAME` configured by `backend/app/core/config.py`.
  - Client: `AsyncIOMotorClient` in `backend/app/core/database.py`; Beanie registers `Farmer`, `Crop`, `Disease`, `Fertilizer`, `MarketPrice`, `GovScheme`, `MSP`, and `Seed` documents.
  - Collections: `farmers`, `crops`, `diseases`, `fertilizers`, `market_prices`, `gov_schemes`, `msps`, and `seeds`, defined in `backend/app/models/`.
- SQLite per farmer/application instance is an architectural requirement in `backend/docs/PRD.md` and `backend/Decisions.md`, not an implemented dependency or database in this repository.

**File Storage:**
- Local repository assets only in `public/`; no object-storage SDK or upload endpoint is detected.

**Caching:**
- None detected.

## Authentication & Identity

**Auth Provider:**
- None currently implemented.
  - Implementation: `backend/app/main.py` mounts only permissive CORS. `backend/Flow.md` explicitly marks Auth/JWT as deferred.
- The frontend has no login client, token storage, or API request layer in `src/`.

## Monitoring & Observability

**Error Tracking:**
- None detected.

**Logs:**
- No application logging setup is detected in `backend/app/` or `src/`; Uvicorn server logging is available only through its runtime defaults.

## CI/CD & Deployment

**Hosting:**
- Not detected. No application deployment manifest, CI workflow, container configuration, or infrastructure-as-code file is committed for the Vite client or `backend/`.

**CI Pipeline:**
- None detected for the application. The embedded `codex/` monorepo has its own upstream tooling and is not an app deployment pipeline.

## Environment Configuration

**Required env vars:**
- `MONGODB_URL` - MongoDB connection URI used in `backend/app/core/config.py`; defaults to local MongoDB if omitted.
- `DATABASE_NAME` - MongoDB database selected in `backend/app/core/config.py`; defaults to `kisansathi` if omitted.
- No Apify token, n8n webhook URL, source API key, JWT secret, or frontend API URL variable is defined in tracked application configuration.

**Secrets location:**
- `backend/.env` is the configured settings file path in `backend/app/core/config.py`; `.env` is excluded by `.gitignore`. No values were inspected.

## Webhooks & Callbacks

**Incoming:**
- None implemented. FastAPI routes in `backend/app/routers/` accept direct REST CRUD requests, not signed webhooks.
- An n8n-to-backend ingestion callback would require a dedicated authenticated endpoint; no such route is present in `backend/app/main.py` or `backend/app/routers/`.

**Outgoing:**
- None implemented. `backend/app/` imports no HTTP client and performs no external calls.

---

*Integration audit: 2026-08-16*
