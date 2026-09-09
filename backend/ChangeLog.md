# ChangeLog

All notable changes to this service. Newest entry on top.
Format: `### YYYY-MM-DD HH:MM - short title`

### 2026-09-09 - Local MongoDB reference seed for the prototype
**What changed:**
- Added a Docker-backed, localhost-only MongoDB setup guide and an idempotent
  seed script for the shared reference database.
- The seed includes labelled local demo records for crops, market/MSP rows,
  schemes, seed/fertilizer references, machinery, and marketplace discovery.
- Corrected the machinery-list filter to use a stable query document rather
  than an unavailable ODM field expression, so seeded directory rows render.
- Added an idempotent local SQLite demo-farmer seed that exercises the personal
  field, crop-stage, soil, sensor, task, reminder and ledger views.
- Connected dashboard market snapshots to the available shared reference
  records, retaining each record's source instead of inventing a price.

**Why:** The prototype needs populated shared-reference screens while keeping
farmer-specific information in SQLite and never presenting illustrative data as
live market, procurement, supplier, or eligibility information.

**Status:** MongoDB is healthy locally and the seed has been applied. The API
health endpoint reports `reference_database: available`.

### 2026-09-09 - Diagnostics, export, and deterministic demo reset
**What changed:**
- Added farmer-scoped diagnostics and request correlation headers.
- Added append-only local audit events plus a bounded JSON farm export.
- Added explicit demo reset and deterministic two-field/reference fixtures.
- Added `demo:check` for repeatable readiness checks.

### 2026-09-09 - Session-only Sarvam configuration API
**What changed:**
- Added safe read/update contracts for Sarvam voice and translation defaults.
- A supplied API key is applied only to the active backend process and is never
  returned, logged, persisted in a database, or written to `.env`.

**Why:** The desktop prototype needs a usable configuration surface without
embedding a provider secret in the frontend bundle or source tree.

**Status:** Configuration still needs a user-provided valid Sarvam key before
any external speech or translation request can succeed.

### 2026-09-09 - Higher-accuracy controlled TFLite demo
**What changed:**
- The explicit local demo launcher now selects the manifest-bound EfficientNetV2-B0 dynamic TFLite tomato specialist.
- The launcher now passes the validated manifest path into FastAPI, closing a gap where artifact preflight ran but runtime did not receive that manifest.

**Why:** A like-for-like controlled benchmark improved dynamic TFLite accuracy from 95.50% to 97.75%, while the manifest must still preserve the review-only safety boundary.

**Status:** Check-only integrity validation passes. The artifact remains rejected for field release pending field/OOD, agronomist and target-device evidence.

### 2026-09-07 - Farmer-confirmed field task engine
**What changed:**
- Exposed the existing `field_tasks` SQLite table through create, filtered list, and status-update APIs.
- Added idempotency protection and explicit `open`, `completed`, and `cancelled` task states.

**Why:** Recommendations must become farmer-owned, auditable actions rather than ending as untracked text.

**Status:** Backend and MCP contract tests pass; no task automatically purchases inputs or actuates equipment.

### 2026-09-07 - Canonical crop lifecycle stages
**What changed:**
- Crop-cycle creation and stage updates normalize common stage wording into stable lifecycle keys: land preparation, seed treatment, sowing, germination, vegetative, flowering, fruiting, grain filling, maturity, and harvest.
- Unsupported stage text is rejected instead of being silently stored outside stage-aware rules.

**Why:** Stage-dependent recommendations require a consistent vocabulary across UI, agent, rules, and persisted history.

**Status:** Regression-tested for normalization and unsupported-stage rejection.

### 2026-09-07 - Sensor-unit safety for irrigation screening
**What changed:**
- Sensor ingestion now normalizes approved unit aliases to canonical `%`, `°C`, `pH`, `mS/cm`, and `mg/kg` units and rejects unsupported units.
- Irrigation screening fails closed when an existing/legacy moisture reading is not stored as a verified percentage.

**Why:** A raw ADC or incompatible measurement cannot safely be compared with a percentage moisture threshold.

**Status:** Regression-tested for normalization, rejection, and legacy fail-closed behavior.

### 2026-09-07 - Field-scoped irrigation weather selection
**What changed:**
- Irrigation planning now uses only the newest weather snapshot within the requested field's coordinate tolerance, instead of the newest snapshot for any farm field.
- The returned assumptions identify whether a location-matched forecast was used or not.

**Why:** A forecast for another field must never create a rain deferral for the requested field.

**Status:** Regression-tested with geographically separated fields and opposite forecast availability.

### 2026-09-07 - Explicit local TF Hub TFLite demo launcher
**What changed:**
- Added `scripts/run_local_tflite_demo.ps1`, which validates the known dynamic-range controlled-demo artifact and starts FastAPI with process-local TFLite settings on a configurable port.
- It does not edit `.env`; normal deployments remain unconfigured unless an operator explicitly enables a provider.

**Why:** The SIH demonstration needs a repeatable runnable path without allowing an ignored demo artifact to silently become the default production service.

**Status:** Check-only validation supported; the script rejects a missing/unversioned artifact.

### 2026-09-07 - Optional TFLite crop-router contract
**What changed:**
- Added an opt-in TensorFlow Lite crop-router adapter and router artifact/gate configuration.
- An unknown crop can now receive ranked crop suggestions, but the API always returns `needs_crop_confirmation`; it never routes a disease specialist without farmer confirmation.
- Extended diagnosis responses to retain `crop_candidates` separately from disease candidates.

**Why:** The vision flow needs a crop-identification stage while preserving the farmer confirmation safety boundary.

**Status:** Tests added; no router artifact is enabled by default.

### 2026-09-07 - Optional TensorFlow Lite crop-health provider
**What changed:**
- Added opt-in `local_tflite_demo` inference for the TF Hub MobileNetV3 tomato specialist.
- It requires an explicit local model/label path and farmer-confirmed configured crop, then persists candidates and limitations through the existing diagnosis envelope.

**Why:** The prototype now has a tested TensorFlow/TFLite path without presenting a controlled-image artifact as a production diagnosis service.

**Status:** Demo-only; full INT8 remains rejected and field validation is outstanding.

### 2026-09-07 - TFLite photo-quality gate
**What changed:**
- Added a local pre-inference capture check for minimum dimensions, extreme
  exposure and near-blank contrast.

**Why:** A screening model must ask for a usable image rather than return a
confident label from visibly unsuitable input.

### 2026-09-07 - TFLite top-two margin gate
**What changed:**
- Added `CROP_HEALTH_MIN_DISEASE_MARGIN`; local TFLite results must now clear
  both the confidence and top-two separation thresholds.

**Why:** A high top score is not sufficient when the nearest alternative is
nearly tied; close calls must remain reviewable.

---

### 2026-09-06 - Source-attributed marketplace directory
**What changed:**
- Added a shared `MarketplaceListing` reference model and bounded `GET /marketplace/listings` search API for machinery, crop inputs, logistics, buyers and exporters.
- Added an HTTPS-only JSON-LD extractor behind the protected universal-data sync boundary. Operators configure reviewed public sources; the service never crawls arbitrary search engines or invents listings.
- Added matching frontend marketplace discovery view and read-only MCP `search_marketplace_listings` tool.

**Why:** Farmer discovery needs one provenance-preserving API path that both the app and agent can use, while booking, purchase, sales and export submission remain outside the MVP.

**Status:** Parser and MCP contract tested; requires approved source URLs before it returns real records.

### 2026-08-18 - Seed and fertilizer recommendation mutators
**What changed:**
- Added deterministic `recommend_seed()` and `recommend_fertilizer()` mutator contracts and their `/seeds/recommend` and `/fertilizer/recommend` endpoints.
- Added request/response schemas and ranked only records already present in the central reference catalog.

**Why:** The Harness needs PRD-aligned recommendation functions without inventing agronomy data that the backend does not store.

**Status:** Ready

### 2026-09-06 - Frontend storage connection contract
**What changed:**
- Added farmer-scoped `GET /v1/storage-status`, reporting the active identity boundary, SQLite availability, and central reference-database availability without exposing database paths.
- Documented the local SQLite storage directories in `.env.example`.

**Why:** The frontend can now verify that its `X-Farmer-ID` is selecting the expected farm-state store and distinguish a working farmer store from unavailable central reference data.

**Status:** Tested

### 2026-08-18 - Official universal-data ingestion and n8n schedule
**What changed:**
- Added idempotent official-source ingestion for the complete current AGMARKNET/data.gov.in mandi feed, current 2026-27 PIB Kharif/Rabi MSP tables, and a derived commodity/crop catalog.
- Extended market, MSP, and crop documents with stable source IDs, source URLs, fetch timestamps, and source-specific fields without fabricating absent arrival, agronomy, or procurement data.
- Added protected internal sync/run-history APIs, persisted ingestion-run telemetry, an active daily 06:30 Asia/Kolkata n8n workflow, Docker Compose support, and a no-admin Windows setup script.
- Added parser/mapping/workflow tests and operational documentation.

**Files touched:**
- `app/scraping/*`
- `app/models/{market_price,msp,crop,ingestion_run}.py`
- `app/schemas/{market_price,msp,crop,ingestion}.py`
- `app/routers/{market_price,msp,crop,ingestion}.py`
- `app/core/{config,database}.py`
- `app/main.py`
- `n8n/universal-data-sync.json`
- `docker-compose.universal-data.yml`
- `scripts/setup_universal_data.ps1`
- `docs/UNIVERSAL_DATA_INGESTION.md`
- `tests/test_universal_data_sources.py`

**Why:** The shared reference database needs repeatable, source-attributed real agricultural data and an operational scheduler rather than manual or invented demo values.

**Status:** Ready; run `scripts/setup_universal_data.ps1` or the documented Docker flow.

### 2026-08-18 - Farm State FastAPI expansion
**What changed:**
- Added a per-`X-Farmer-ID` SQLite Farm State store inside the existing FastAPI service with foreign keys, versioned schema initialization, and immutable field, crop-stage, soil, sensor, irrigation, alert, diagnosis, advisor, and report records.
- Added `/v1` contracts and routers for profile/preferences, fields and GeoJSON map summaries, crop cycles/timelines, soil health, sensor observations, weather, irrigation plans/events/reminders, alerts/dashboard, diagnoses, advisor sessions, voice fallback, and reports.
- Added Open-Meteo weather integration plus an explicitly labelled offline fixture mode; unconfigured vision, advisor, and voice providers return safe provider-unavailable or inconclusive states.
- Extended market-price records and APIs with source/freshness metadata, arrivals, summary/history/trend view models, timestamp-aware indexes, configurable cost assumptions, and the documented net-realisation formula.
- Added focused SQLite isolation, alert/irrigation, diagnosis-safety, and market math tests.

**Files touched:**
- `app/farm_state/*`
- `app/schemas/farm_state.py`
- `app/routers/farm_state.py`
- `app/routers/weather.py`
- `app/routers/assistants.py`
- `app/services/weather.py`
- `app/services/market.py`
- `app/models/market_price.py`
- `app/schemas/market_price.py`
- `app/routers/market_price.py`
- `app/main.py`
- `app/core/config.py`
- `tests/*`

**Why:** The frontend parity plan requires personal farm state and explainable operational read models while preserving MongoDB for shared reference data.

**Status:** Ready for provider credentials, frontend wiring, and broader integration coverage.

### 2026-08-18 - Frontend merge contract hardening
**What changed:**
- Added list read models for reminders and reports so the frontend can render persisted local actions after reload.
- Added a bounded MongoDB connection timeout and degraded startup mode; Farm State remains available when the shared reference database is offline.
- Completed the frontend API client/context wiring for profile, fields, map, soil, weather, irrigation, alerts, diagnosis, advisor, voice, market, and reports.
- Added explicit frontend loading, empty, error, source, and provider-unavailable states and removed active page dependencies on simulated business data.

**Files touched:**
- `app/core/config.py`
- `app/core/database.py`
- `app/main.py`
- `app/routers/farm_state.py`
- `../src/api/*`
- `../src/context/FarmDataContext.jsx`
- `../src/pages/*`
- `../FRONTEND_BACKEND_MERGE_PLAN.md`

**Why:** The merge must preserve local farmer privacy and remain usable when MongoDB or external providers are unavailable, while keeping every visible frontend action tied to a backend contract.

**Status:** Integrated and verified with backend contract smoke tests, frontend lint/build, and browser flow checks.

### 2026-08-15 - GovScheme eligibility mutator 
**What changed:**
- Added a reusable `check_scheme_eligibility()` mutator contract for government scheme eligibility checks
- Added request/response schemas for scheme eligibility evaluation
- Added `/gov-schemes/check-eligibility` to return schemes where `applicable_states` contains the farmer state or is empty for nationwide coverage

**Files touched:**
- `app/services/gov_scheme_mutator.py`
- `app/schemas/gov_scheme.py`
- `app/routers/gov_scheme.py`
- `Flow.md`
- `Decisions.md`
- `ChangeLog.md`

**Why:** Needed a PRD-aligned `check_scheme_eligibility()` function that can be reused later by actor-based execution while keeping a simple HTTP surface for direct callers.

**Status:** Ready

### 2026-08-15 - Disease CRUD surface
**What changed:**
- Added the Disease Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/diseases`
- Registered the Disease model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/disease.py`
- `app/schemas/disease.py`
- `app/routers/disease.py`
- `app/core/database.py`
- `app/main.py`
- `Flow.md`
- `Decisions.md`
- `ChangeLog.md`

**Why:** Needed a standard Disease CRUD API for reference/knowledge data that pairs with ML vision model output and matches the existing shared-data collection pattern.

**Status:** Ready

### 2026-08-15 - Seed CRUD surface
**What changed:**
- Added the Seed Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/seeds`
- Registered the Seed model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/seed.py`
- `app/schemas/seed.py`
- `app/routers/seed.py`
- `app/core/database.py`
- `app/main.py`
- `Flow.md`
- `Decisions.md`
- `ChangeLog.md`

**Why:** Needed a standard Seed CRUD API that matches the existing Farmer/Crop/MarketPrice/GovScheme/MSP reference-data pattern.

**Status:** Ready

### 2026-08-15 - MarketPrice mandi comparison endpoint
**What changed:**
- Added a computed compare endpoint at `/market-prices/compare/{crop_name}`
- Added comparison response schemas for per-mandi net realisation breakdowns
- Implemented deterministic transport tiers and sorted results by net realisation descending

**Files touched:**
- `app/schemas/market_price.py`
- `app/routers/market_price.py`
- `Flow.md`
- `ChangeLog.md`

**Why:** Needed a computed endpoint that evaluates multiple mandis for a crop and returns a transparent net-realisation breakdown for the farmer.

**Status:** Ready

### 2026-08-15 - Fertilizer CRUD surface
**What changed:**
- Added the Fertilizer Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/fertilizer`
- Registered the Fertilizer model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/fertilizer.py`
- `app/schemas/fertilizer.py`
- `app/routers/fertilizer.py`
- `app/core/database.py`
- `app/main.py`
- `Flow.md`
- `ChangeLog.md`

**Why:** Needed a standard Fertilizer CRUD API that matches the existing shared-reference-data pattern and covers the central fertilizer catalog.

**Status:** Ready

### 2026-08-15 - MSP CRUD surface
**What changed:**
- Added the MSP Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/msp`
- Added a crop-scoped listing route at `/msp/by-crop/{crop_name}`
- Registered the MSP model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/msp.py`
- `app/schemas/msp.py`
- `app/routers/msp.py`
- `app/core/database.py`
- `app/main.py`
- `Flow.md`
- `ChangeLog.md`

**Why:** Needed a standard MSP CRUD API that matches the existing reference-data pattern and supports crop-scoped lookup for harness tool wrapping.

**Status:** Ready

### 2026-08-15 - GovScheme CRUD surface
**What changed:**
- Added the GovScheme Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/gov-schemes`
- Added a state-filtered listing route at `/gov-schemes/by-state/{state}` that includes nationwide schemes
- Registered the GovScheme model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/gov_scheme.py`
- `app/schemas/gov_scheme.py`
- `app/routers/gov_scheme.py`
- `app/core/database.py`
- `app/main.py`
- `Flow.md`
- `ChangeLog.md`

**Why:** Needed a standard GovScheme CRUD API that matches the Farmer/Crop/MarketPrice pattern and exposes state-scoped access for the shared reference database.

**Status:** Ready

### 2026-08-15 - MarketPrice CRUD surface
**What changed:**
- Added the MarketPrice Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/market-prices`
- Added a crop-filtered listing route at `/market-prices/by-crop/{crop_name}`
- Registered the MarketPrice model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/market_price.py`
- `app/schemas/market_price.py`
- `app/routers/market_price.py`
- `app/core/database.py`
- `app/main.py`
- `ChangeLog.md`

**Why:** Needed a standard MarketPrice CRUD API that matches the Farmer/Crop pattern and supports crop-scoped price lookups across mandis.

**Status:** Ready

### 2026-08-15 - Crop CRUD surface
**What changed:**
- Added the Crop Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/crops`
- Registered the Crop model with Beanie startup initialization and mounted the router in FastAPI

**Files touched:**
- `app/models/crop.py`
- `app/schemas/crop.py`
- `app/routers/crop.py`
- `app/core/database.py`
- `app/main.py`
- `CHANGELOG.md`

**Why:** Needed a standard Crop CRUD API that matches the existing Farmer pattern and can be wrapped by the Harness tool layer later.

**Status:** Ready

### 2026-08-15 - Farmer CRUD surface
**What changed:**
- Added the Farmer Beanie document and Pydantic schemas for create/update/response shapes
- Added full CRUD router for `/farmers`
- Registered the Farmer model with Beanie startup initialization

**Files touched:**
- `app/models/farmer.py`
- `app/schemas/farmer.py`
- `app/routers/farmer.py`
- `app/core/database.py`
- `app/main.py`

**Why:** Needed a standard Farmer CRUD API that matches the backend conventions and can be wrapped by the Harness tool layer later.

**Status:** Ready

### Template (copy this for each new entry)
### 2026-08-18 - MCP-safe write idempotency boundary
**What changed:**
- Added per-farmer SQLite idempotency records for profile, field, crop-cycle, soil-test, irrigation, reminder, report, and alert-status writes
- Added `Idempotency-Key` replay and payload-conflict handling to those mutation routes
- Added backend tests covering replay and key reuse with a different payload

**Files touched:**
- `app/farm_state/store.py`
- `app/routers/farm_state.py`
- `tests/test_farm_state.py`

**Why:** The conversational agent may retry a timed-out approved write. Replaying the same request must return the original result instead of creating duplicate farm state.

**Status:** Tested

### 2026-09-06 - Explicit marketplace quote comparison
**What changed:**
- Added `POST /marketplace/compare-quotes`, which totals only supplier/farmer-provided base, delivery, loading, unloading, and additional costs.
- Added assistant tools for generic, machinery, and logistics quote comparisons.

**Why:** A farmer needs an all-in comparison after discovering providers, but no model should invent missing logistics, tax, or exchange-rate values.

**Status:** Tested

### 2026-09-06 - MSP versus mandi reference comparison
**What changed:**
- Added `GET /msp/compare-market`, which selects the newest official MSP record and newest observation per matching mandi.
- Preserved MSP, mandi source, observation date and an explicit warning that this is not a procurement guarantee.

**Why:** A farmer needs a transparent reference comparison before deciding whether to verify a procurement route or sell in a market.

**Status:** Tested

### 2026-09-06 - Marketplace setup visibility
**What changed:**
- Added `GET /marketplace/status` plus frontend and MCP access to show whether approved directory sources are configured.

**Why:** The directory must distinguish a genuinely empty search from an installation that has not configured or ingested a permitted source.

**Status:** Tested

### 2026-09-06 - Bounded APEDA exporter adapter
**What changed:**
- Added an explicitly configured `apeda_exporters` adapter for APEDA's public first exporter-directory page.

**Why:** Exporter discovery can use a real official public directory without accessing its protected contact workflow or broadly crawling its pages.

**Status:** Tested

### 2026-09-06 - Default APEDA exporter registry
**What changed:**
- Made the vetted APEDA first-page exporter directory the default marketplace source configuration; deployment settings may override it.

**Why:** Exporter discovery has a usable real source on first setup while ingestion remains protected and bounded.

**Status:** Tested

### 2026-09-06 - Bounded field observation history
**What changed:**
- Added `GET /v1/fields/{field_id}/observations/history` with an explicit measurement and bounded limit.

**Why:** The device onboarding UI needs source-preserving history to display a trend; it must not synthesize a trend from a latest-only reading.

**Status:** Tested

### 2026-09-07 - Farmer-scoped finance ledger
**What changed:**
- Added `ledger_entries` to the existing farmer SQLite store, with income/expense, INR amount, optional field/crop context, source, and audit-preserving `active`/`void` status.
- Added idempotent create, list, summary, and status-update Farm State endpoints under `/v1/ledger`.

**Why:** The Finance screen previously used browser-only storage, which meant the agent and other farmer-state views could not safely read the same ledger.

**Status:** Tested

### 2026-09-07 - Authenticated device telemetry ingestion
**What changed:**
- Added `POST /v1/device-ingestion/observations` for provisioned soil-node gateway packets, separate from farmer/agent sensor writes.
- Packets are bearer-authenticated and farmer/field scoped through environment-held device credentials; `(device_id, boot_id, sequence)` replays without duplicating readings.
- The SQLite store preserves raw packet/sample Modbus address and CRC evidence. Only CRC-valid, unit-normalized samples become sensor readings; a read-only device-health endpoint exposes freshness without revealing secrets.

**Why:** Field hardware needs a traceable telemetry boundary rather than treating an ESP32 as an unrestricted agent client.

**Status:** Tested with a valid/CRC-failed mixed packet, replay, scoped observation persistence, health read, and unprovisioned-device rejection.

### 2026-09-08 - Reviewable crop-stage action proposals
**What changed:**
- Added `GET /v1/fields/{field_id}/action-proposals`, which maps an active canonical crop stage to generic lifecycle prompts and suppresses any already-open matching task.
- The route is read-only: proposals never persist, purchase inputs, apply treatments, schedule irrigation, or control hardware.

**Why:** A lifecycle assistant must turn stage context into clear next work while preserving the farmer's confirmation boundary.

**Status:** Tested for stage context, no implicit task creation, and duplicate suppression after acceptance.

### 2026-09-08 - Evidence-first crop option screening
**What changed:**
- Added `GET /v1/fields/{field_id}/crop-options`, plus the matching agent read
  tool. It combines a farmer-owned field with central crop-reference metadata
  and reports season, rotation and soil-type evidence, conflicts and missing
  evidence for each returned option.
- The endpoint fails explicitly when central reference data is unavailable and
  does not produce yield, profit, fertilizer, seed, purchase or crop-choice
  claims.

**Why:** Crop selection is a consequential farming decision. The early product
needs a transparent evidence checklist before it has validated local yield,
price and soil-response models.

**Status:** Unit-tested for missing evidence and explicit conflicts; agent tool
registration is covered. It remains screening support, not optimization.

### 2026-09-08 - Consented diagnosis-feedback records
**What changed:**
- Added a farmer-scoped append-only diagnosis-feedback record and
  `POST /v1/diagnoses/{diagnosis_id}/feedback`.
- Feedback records a farmer's confirmation/correction/unknown response, optional
  crop/label/note, and explicit sharing consent. It returns an explicit
  `requires_expert_review_and_separate_export` training boundary.

**Why:** Fine-tuning requires field evidence with reviewable provenance. A
farmer response can be valuable context but must not silently become ground
truth, upload an image, or retrain a model.

**Status:** Tested for consent persistence, idempotent replay, and farmer-store
isolation. No export, model update, or treatment action exists.

### 2026-09-08 - Local TFLite completion is manifest-gated
**What changed:**
- Replaced the mutable boolean completion switch with a versioned release-manifest check. A completed local TFLite result now requires an approved status, matching model and label SHA-256 checksums, farmer-confirmed crop match, and explicit passed independent-field, unknown/OOD, and agronomist-review gates.
- Missing, malformed, rejected, or artifact-mismatched manifests return ranked candidates under `needs_expert_review`.

**Why:** An environment flag can accidentally turn a controlled artifact into a diagnosis. Binding the runtime to evaluated artifacts makes the safety boundary testable and auditable.

**Status:** Tested for missing manifest review-only behavior, successful matching release behavior, and checksum mismatch rejection. This is not a cryptographic signing or field-evidence substitute.

### 2026-09-08 - Irrigation screening guards against rain-only deferral
**What changed:**
- Added a critical-moisture screening bound: a high rain probability cannot by itself defer advice for a dry field.
- Added a `reassess_after_recent_irrigation` state when a farmer-recorded irrigation is less than 12 hours old and moisture is not critically low.

**Why:** A probability forecast is not proof of delivered water, and another irrigation immediately after a recorded event may waste water or obscure sensor/field issues.

**Status:** Tested as a read-only recommendation rule. It does not calculate volume, schedule equipment, or actuate a pump.

### 2026-09-08 - Farmer-scoped irrigation history
**What changed:**
- Added `GET /v1/irrigation-events` with an optional field filter and bounded result count.
- The route returns only farmer-owned, explicitly recorded events. It never estimates unrecorded water or reported volume.

**Why:** The irrigation screen and agent need the same auditable event history to support a post-irrigation reassessment workflow.

**Status:** Tested for field filtering and farmer isolation.

### 2026-09-08 - Windows universal-data MongoDB path quoting
**What changed:**
- Fixed `setup_universal_data.ps1` to explicitly quote MongoDB `--dbpath` and `--logpath` values when using `Start-Process`.

**Why:** `Start-Process` did not preserve quotes from an argument array, so a workspace path containing spaces made MongoDB interpret the remainder of the data path as a command.

**Status:** Direct startup probe identified the failure; the corrected script is ready for the same local setup flow.

### 2026-09-08 - Demo reload excludes mutable runtime dependencies
**What changed:**
- Excluded ignored `backend/.runtime` content from the local TFLite demo's Uvicorn reload watcher.
- Passed each reload-exclusion glob in `--reload-exclude=<glob>` form so
  PowerShell cannot expand it into the runtime directory's individual files.

**Why:** n8n installation writes dependency files under that directory; watching them restarted and stopped the paired demo stack.

**Status:** The launcher still reloads backend source but no longer treats runtime dependency writes as application edits or Uvicorn positional arguments.

### 2026-09-08 - Controlled TFLite output is review-only
**What changed:**
- Added an explicit default-off completion gate for `local_tflite_demo`. High-scoring outputs from the controlled PlantVillage artifact are persisted as ranked review candidates under `needs_expert_review`, not completed diagnoses.
- Added an OOD safety regression after a project non-crop image was confidently classified as a tomato disease by the constrained label set.

**Why:** The artifact lacks an unknown/OOD class and farmer-phone field validation, so score/margin thresholds alone cannot establish that an image belongs to its disease label space.

**Status:** Tested. Only a future versioned field/OOD release gate may explicitly authorize completed output.

### 2026-08-15 - Initial scaffold
**What changed:**
- Created FastAPI app skeleton with Beanie + Motor + MongoDB connection
- Added `Field` model as reference pattern

**Files touched:**
- `app/main.py`
- `app/core/database.py`

**Why:** See Decisions.md entry "Chose Beanie over raw Motor/PyMongo"

**Status:** Working, tested via /docs Swagger UI

### 2026-09-09 - Structured nearby reference discovery
**What changed:**
- Added normalized administrative filtering and bounded nearby machinery and marketplace endpoints.
- Added optional provider coordinates, service radius and geocode/verification metadata to shared records.
- Added distance calculation and geospatial index declarations for future Mongo `$near` optimization.
- Fixed the state-scoped scheme query for Beanie versions where list-field `.in_()` is not callable.

**Why:** The MVP demo profile includes a display annotation (`local demo`) that must never become an exact operational state filter, and provider discovery needs to be tied to the selected field location.

**Status:** Backend tests pass; live seeded endpoint smoke checks pass on the dedicated demo port.
# 2026-09-07 — Guarded local crop-health inference integration
- Added an opt-in local two-stage crop router/specialist adapter for versioned
  PyTorch fine-tuning checkpoints. It fails closed for unknown crops, missing
  specialists, missing runtime, and uncertain inference.
- The diagnosis API now accepts `confirmed_crop`, persists the transparent
  inference envelope, and returns model metadata/candidates/limitations.
- The frontend forwards the farmer-confirmed crop with each crop-health photo.
## 2026-09-09

- Added farmer-scoped `/v1/diagnostics` with safe SQLite counts, reference catalog counts, degraded component status, and demo-data disclosure.
- Added `X-Request-ID` response correlation for UI and Codex requests without returning farmer paths or credentials.
