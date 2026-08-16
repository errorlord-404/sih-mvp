# Codebase Concerns

**Analysis Date:** 2026-08-16

## Tech Debt

**Frontend is disconnected from the backend:**
- Issue: The React application reads hard-coded farmer, field, weather, market, moisture, lifecycle, and chat values from `src/data/dashboard.js`, `src/data/fields.js`, and `src/data/chat.js`. There is no `fetch`, API client, or backend base-URL configuration anywhere under `src/`.
- Files: `src/data/dashboard.js`, `src/data/fields.js`, `src/data/chat.js`, `src/pages/Dashboard.jsx`, `src/pages/FieldDetail.jsx`, `src/pages/AIAssistant.jsx`, `src/pages/VoiceAssistant.jsx`
- Impact: The UI can present recommendations and values that do not exist in MongoDB, and creating or changing central data through `backend/app/routers/*.py` cannot affect the farmer experience.
- Fix approach: Introduce a typed API client and query/state layer under `src/`; replace static operational values with API-backed loading, empty, stale, and failure states. Keep only clearly marked demo fixtures separate from live paths.

**Copy-pasted CRUD router implementation:**
- Issue: Eight router modules duplicate ID parsing, model-to-schema conversion, unbounded listing, mutation, and deletion code.
- Files: `backend/app/routers/crop.py`, `backend/app/routers/disease.py`, `backend/app/routers/farmer.py`, `backend/app/routers/fertilizer.py`, `backend/app/routers/gov_scheme.py`, `backend/app/routers/market_price.py`, `backend/app/routers/msp.py`, `backend/app/routers/seed.py`
- Impact: Validation, pagination, authorization, audit metadata, and error-handling fixes will drift across endpoints.
- Fix approach: Extract a small shared repository/service and response utility while retaining domain-specific routers and explicit schemas; add contract tests to hold the common behavior stable.

**Reference data has no governed ingestion path:**
- Issue: Models are populated only through public create/update/delete endpoints; `backend/app/` contains no external source client, scraper, job state, provenance fields, or import workflow. No Apify Actor or n8n workflow files are present.
- Files: `backend/app/models/market_price.py`, `backend/app/models/gov_scheme.py`, `backend/app/models/msp.py`, `backend/app/routers/market_price.py`, `backend/app/routers/gov_scheme.py`, `backend/app/routers/msp.py`
- Impact: Mandi prices, MSPs, schemes, suppliers, and crop facts cannot be kept fresh or demonstrated as sourced, contrary to the trust/provenance requirements in `backend/docs/PRD.md`.
- Fix approach: Define an Apify Actor per permitted source that emits a versioned normalized record and source metadata. Trigger it from scheduled n8n workflows; n8n must validate a webhook signature, preserve raw-run metadata, transform to a canonical import payload, and call a protected idempotent backend ingestion endpoint. Store `source_url`, `source_name`, `source_record_id`, `observed_at`, `ingested_at`, `content_hash`, `run_id`, and validation status; enforce unique source keys and retain rejected records for review.

**Configuration and deployment are under-specified:**
- Issue: The backend has only local defaults for MongoDB in `backend/app/core/config.py`; the repository has no documented production environment contract, container definition, health check, migration/index bootstrap, or CI workflow.
- Files: `backend/app/core/config.py`, `backend/app/core/database.py`, `backend/requirements.txt`, `package.json`
- Impact: The service can start against an unintended local database, while repeatable builds, deployment, recovery, and readiness validation are not defined.
- Fix approach: Require deployment-specific configuration, provide a redacted `.env.example`, add `/health` and `/ready` endpoints, define build/run artifacts, and add CI that runs linting, tests, and dependency/security checks.

## Known Bugs

**Government-scheme eligibility ignores supplied criteria:**
- Symptoms: `POST /gov-schemes/check-eligibility` returns schemes based only on state, even when the request supplies eligibility criteria.
- Files: `backend/app/routers/gov_scheme.py`, `backend/app/services/gov_scheme_mutator.py`, `backend/app/schemas/gov_scheme.py`
- Trigger: Send a `SchemeEligibilityRequest` whose criteria conflict with a scheme's criteria; `MongoGovSchemeMutator` assigns them to `_` and returns state/nationwide records.
- Workaround: Treat results as a state-scoped discovery list, not an eligibility decision, until criteria are structured and evaluated.

**Mandi comparison produces a false precision recommendation:**
- Symptoms: `GET /market-prices/compare/{crop_name}` ranks mandis from fixed transport/loading constants, zero unloading/storage/spoilage, and price for exactly one quintal.
- Files: `backend/app/routers/market_price.py`, `backend/app/schemas/market_price.py`
- Trigger: Compare any crop for a farmer district/state; the endpoint returns a numeric `net_realisation` despite lacking quantity, distance/route, actual fee rules, logistics quotes, storage terms, or price freshness filtering.
- Workaround: Label the response as a demo estimate and do not use it for a sale decision. Replace constants with explicit inputs or source-backed rate calculators, quantity and unit handling, and a confidence/provenance response.

**Invalid field route renders unrelated data:**
- Symptoms: Opening an unknown `/fields/:fieldId` displays the first static field instead of a not-found state.
- Files: `src/pages/FieldDetail.jsx`, `src/data/fields.js`
- Trigger: Navigate to `/fields/unknown`.
- Workaround: None in the current UI; validate the route parameter and render a localized 404/empty state.

## Security Considerations

**All central records are publicly writable and deletable:**
- Risk: Any caller can create, alter, enumerate, or delete farmer profiles and shared agricultural reference data because no authentication, role check, or ownership check is applied.
- Files: `backend/app/main.py`, `backend/app/routers/farmer.py`, `backend/app/routers/crop.py`, `backend/app/routers/disease.py`, `backend/app/routers/fertilizer.py`, `backend/app/routers/gov_scheme.py`, `backend/app/routers/market_price.py`, `backend/app/routers/msp.py`, `backend/app/routers/seed.py`
- Current mitigation: Pydantic shape validation and 404/400 responses only.
- Recommendations: Add authentication before exposing the service, restrict reference-data writes to an admin/ingestion role, authorize farmer data per subject, add immutable audit logs, and disable destructive routes unless the product needs them.

**Permissive CORS configuration is incompatible with credentialed access:**
- Risk: `allow_origins=["*"]` combined with `allow_credentials=True` invites unsafe cross-origin assumptions and cannot be a secure browser policy once credentials are introduced.
- Files: `backend/app/main.py`
- Current mitigation: Not applicable.
- Recommendations: Configure an allow-list per deployment, only enable credentials where needed, restrict methods/headers, and add CORS integration tests.

**Sensitive farmer contact data is centrally exposed without privacy controls:**
- Risk: Names, phone numbers, locations, languages, and field references are stored and returned in full from central MongoDB.
- Files: `backend/app/models/farmer.py`, `backend/app/schemas/farmer.py`, `backend/app/routers/farmer.py`
- Current mitigation: Not detected.
- Recommendations: Align the model with the intended per-farmer SQLite boundary in `backend/AGENTS.md` and `backend/docs/PRD.md`; minimize PII, encrypt/protect databases and backups, define retention/deletion policy, and avoid broad list endpoints.

**External ingestion would be an unprotected trust boundary without a signed contract:**
- Risk: An Apify Actor or n8n webhook that posts directly to current CRUD endpoints could be spoofed, replayed, or used to poison recommendations.
- Files: `backend/app/main.py`, `backend/app/routers/market_price.py`, `backend/app/routers/gov_scheme.py`, `backend/app/routers/msp.py`
- Current mitigation: Not detected; there is no actor/webhook implementation.
- Recommendations: Use a dedicated ingestion route with HMAC signature verification, timestamp/replay protection, least-privilege service credentials, schema allow-lists, source/domain validation, rate limits, quarantine, and approval for high-impact records.

## Performance Bottlenecks

**Collection endpoints load every record into memory:**
- Problem: List and crop/state filtering routes call `find_all().to_list()` or `find(...).to_list()` with no limit, cursor, sort, or projection.
- Files: `backend/app/routers/crop.py`, `backend/app/routers/disease.py`, `backend/app/routers/farmer.py`, `backend/app/routers/fertilizer.py`, `backend/app/routers/gov_scheme.py`, `backend/app/routers/market_price.py`, `backend/app/routers/msp.py`, `backend/app/routers/seed.py`
- Cause: API schema exposes whole collections and models declare no query indexes.
- Improvement path: Add pagination and deterministic sort; create indexes for query keys such as crop/date/market, crop/season/year, and normalized state; cap and paginate comparison candidates.

**Mandi comparison scales linearly and uses unbounded historical records:**
- Problem: Every price record for a crop is read and sorted in application memory, including stale or duplicate records.
- Files: `backend/app/routers/market_price.py`, `backend/app/models/market_price.py`
- Cause: No current-price selection, source deduplication, index, or database-side query constraints.
- Improvement path: Materialize or query the latest verified observation per mandi/crop, index the lookup, require freshness duration, and limit candidate markets by distance/service area.

## Fragile Areas

**The central/personal data ownership boundary is internally inconsistent:**
- Files: `backend/AGENTS.md`, `backend/docs/PRD.md`, `backend/app/models/farmer.py`, `backend/app/routers/farmer.py`, `backend/Flow.md`
- Why fragile: `backend/AGENTS.md` says per-farmer data belongs in local SQLite, but MongoDB persists a `Farmer` document with `field_ids`; the flow document describes it as a central farmer record. There is no local SQLite schema, sync protocol, conflict resolution, identity mapping, or offline queue implementation.
- Safe modification: Decide and document the authoritative owner for profile and field identity before adding fields, IoT, expenses, harvests, or sales. Add versioned sync contracts and idempotency keys before connecting the frontend or harness.
- Test coverage: No backend or frontend test files/configuration are present outside the vendored `codex/` tree.

**Agronomic recommendations are rendered as facts without source, timestamp, or uncertainty:**
- Files: `src/pages/AIAssistant.jsx`, `src/pages/VoiceAssistant.jsx`, `src/pages/FieldDetail.jsx`, `src/data/chat.js`, `backend/app/models/crop.py`, `backend/app/models/disease.py`, `backend/app/models/fertilizer.py`
- Why fragile: Static text recommends irrigation, fertilizer dose, and disease monitoring while no current weather, soil test, crop-stage, or approved treatment source is supplied. The product brief requires tool-sourced facts and explainability.
- Safe modification: Return recommendations from a rules/decision service with field inputs, citations, observed timestamps, confidence, alternatives, safety category, and clinician/agronomist escalation conditions; display unavailable/stale data rather than fabricating a response.
- Test coverage: No recommendation, evidence, or safety-policy tests are present.

**Sensor schema is orphaned:**
- Files: `backend/app/schemas/sensors.py`, `backend/app/main.py`, `backend/app/core/database.py`, `backend/Flow.md`
- Why fragile: Sensor request schemas exist but no model, router, database registration, retention policy, device identity, validation range, or local SQLite ownership decision exists.
- Safe modification: Keep device telemetry in the client/local boundary unless a centralized use case is approved; then add authenticated device ingestion, idempotent sequence/timestamp handling, calibration metadata, and command acknowledgements before exposing irrigation logic.
- Test coverage: No sensor ingestion or device command tests are present.

## Scaling Limits

**No offline/synchronization implementation for the farm digital twin:**
- Current capacity: The repository contains a central MongoDB API and static browser data only.
- Limit: The required per-farmer SQLite records, offline queue, field/crop-cycle history, conflict handling, and sync-on-reconnect behavior described in `backend/docs/PRD.md` are absent.
- Scaling path: Define a local SQLite schema and sync API around append-only farm events; use device-local IDs, revisions, conflict rules, retry/backoff, and selective reference-data replication.

**No tool/harness integration boundary exists:**
- Current capacity: FastAPI CRUD endpoints only; no custom farming handler files are present under the Rust source tree.
- Limit: The app cannot make the tool calls, enforce timeouts/retries, inject farmer context, or require confirmation for physical/financial actions as specified in `backend/docs/PRD.md` and `README.md`.
- Scaling path: Publish versioned tool contracts for read-only, physical, financial, and high-risk operations; implement bounded handlers, policy checks, confirmation records, and end-to-end tracing before allowing IoT actuation.

## Dependencies at Risk

**Unpinned frontend dependency ranges:**
- Risk: `package.json` accepts future minor versions for the browser runtime, router, Tailwind, Vite, and lint plugins.
- Impact: Clean installs can change behavior or build output outside the lockfile workflow, particularly if different package managers are used.
- Migration plan: Use the committed `package-lock.json` with `npm ci` in CI, document the supported Node/npm versions, and adopt a dependency-update process with smoke tests.

**Backend dependency installation is not lockfile-backed:**
- Risk: `backend/requirements.txt` pins direct packages but has no reproducible resolver lock or documented Python version.
- Impact: Transitive dependency resolution and runtime compatibility can vary between development and deployment.
- Migration plan: Declare supported Python version, generate a hash-checked lockfile from `backend/requirements.txt`, and scan/update dependencies in CI.

## Missing Critical Features

**Core SIH farming-assistant capabilities are absent:**
- Problem: There are no implementations for weather acquisition, field/digital-twin lifecycle, soil analysis, IoT device control and safety confirmation, crop recommendation, disease-image diagnosis, price forecasting, supplier/machinery discovery, finance, local SQLite offline operation, multilingual STT/TTS/translation, alerts, or explainable recommendation orchestration.
- Blocks: The continuous demo journey defined in `backend/docs/PRD.md` cannot use live data from question through approved irrigation, diagnosis, market decision, sale, and season-profit feedback.

**Data quality and provenance are absent from central reference models:**
- Problem: Crop, disease, fertilizer, seed, market-price, MSP, and scheme records omit source, verifier, observed/expiry times, units/currency metadata, canonical naming, ingestion version, and review status.
- Blocks: The agent and frontend cannot distinguish verified, stale, localized, or mock data, despite the explicit trust requirements in `backend/docs/PRD.md`.

## Test Coverage Gaps

**Backend API, database, and lifecycle paths are untested:**
- What's not tested: CRUD validation, invalid identifiers, database startup/shutdown, response serialization, eligibility semantics, error paths, data indexes, and Mandi net-realisation math.
- Files: `backend/app/main.py`, `backend/app/core/database.py`, `backend/app/routers/*.py`, `backend/app/services/gov_scheme_mutator.py`
- Risk: Changes can silently break the sole API surface or produce unsafe agricultural/economic advice.
- Priority: High

**Frontend operational views and localization are untested:**
- What's not tested: Route validity, static-to-live-data transition, chat/voice behaviors, Hindi rendering, loading/failure states, accessible keyboard flows, and stale-data presentation.
- Files: `src/routes/index.jsx`, `src/pages/AIAssistant.jsx`, `src/pages/VoiceAssistant.jsx`, `src/pages/FieldDetail.jsx`, `src/hooks/useLanguage.jsx`
- Risk: The demo UI can appear functional while producing unsupported operational advice or masking broken integration.
- Priority: High

---

*Concerns audit: 2026-08-16*
