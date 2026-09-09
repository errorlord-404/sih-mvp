# Flow.md

Describes how requests move through this service, so a bug can be traced to
"before" or "after" a given point. Update whenever you add a new module or
change how existing ones connect.

--- 

## High-level request flow
Client request
  -> FastAPI router (app/routers/*.py)
    -> validates against schema (app/schemas/*.py)
  -> shared reference router -> Beanie Document method (app/models/*.py)
    -> Motor driver -> MongoDB (central, shared reference DB)
  -> Farm State router -> per-farmer FarmStateStore (app/farm_state/*)
    -> SQLite file selected from validated X-Farmer-ID
  -> response serialized back through schema
  -> JSON response to client

## Local shared-reference bootstrap
`docker-compose.universal-data.yml` MongoDB service
  -> binds the central/reference database to localhost only and persists it in
     the named `mongodb_data` volume
  -> `scripts/seed_local_reference_data.py` upserts visibly marked
     `local_demo_seed_not_live` records
  -> backend starts `init_db()` and exposes those records through existing
     shared-reference routers (such as `/gov-schemes` and market routes)
  -> machinery filters form a plain Mongo query document before the listing is
     serialized, avoiding ODM class-field compatibility differences
  -> farmer-owned field, sensor, ledger and diagnosis requests remain on the
     independent per-farmer SQLite Farm State path

## TFLite crop-health routing
`POST /v1/diagnoses` with a confirmed crop
  -> validates image and stores immutable upload metadata in the farmer SQLite database
  -> `local_tflite_demo` runs only the configured crop specialist
  -> confidence and top-one/top-two margin gates reject uncertain candidates
  -> a mounted manifest must bind the exact model/labels to passed field, OOD,
     and agronomist gates before `completed`; otherwise return `needs_expert_review`

`POST /v1/diagnoses` with no/unknown crop
  -> optional configured crop-router returns ranked `crop_candidates`
  -> response remains `needs_crop_confirmation`; no disease specialist runs
  -> frontend/agent must send a later request with farmer-confirmed crop

### Field-scoped irrigation screening
`GET /v1/fields/{field_id}/irrigation-plan`
  -> reads the requested field's moisture and active crop stage
  -> uses moisture only when its stored unit is canonical `%`; raw/legacy values become insufficient data
  -> selects only the latest cached weather snapshot near that field's centroid
  -> critical dryness overrides a rain-probability-only deferral; a recent recorded irrigation requests reassessment
  -> applies a read-only screening rule and states whether rain evidence was location-matched
  -> never starts a pump or valve

`POST /v1/irrigation-events` after farmer confirmation
  -> writes the event into the farmer's SQLite store with idempotency
  -> `GET /v1/irrigation-events?field_id=...` returns bounded farmer-owned history
  -> UI/MCP use the same history; no value is inferred for an unrecorded volume

### Crop-stage lifecycle writes
`POST /v1/fields/{field_id}/crop-cycles` or `PATCH /v1/crop-cycles/{cycle_id}/stage`
  -> validates and canonicalizes the lifecycle stage before it is persisted
  -> stage-aware rules consume stable keys such as `flowering` and `grain_filling`

### Farmer-confirmed task lifecycle
Farmer UI or Codex/MCP agent after confirmation
  -> `POST /v1/tasks` stores a field, title, optional due time, and source in farmer SQLite
  -> `GET /v1/tasks` returns status/field-filtered action history
  -> `PATCH /v1/tasks/{task_id}` marks the task completed or cancelled
  -> task state records intent and outcome; it never authorizes transactions or hardware action

### Controlled TFLite demo launch
`backend/scripts/run_local_tflite_demo.ps1`
  -> verifies the ignored EfficientNetV2-B0 dynamic-range tomato artifact and labels against the controlled-demo manifest
  -> supplies `local_tflite_demo` model, labels and manifest settings to the launched FastAPI process only
  -> frontend or MCP sends a farmer-confirmed tomato image to `/v1/diagnoses`
  -> API persists transparent model/candidate/limitation evidence in farmer SQLite
  -> because the supplied manifest is explicitly rejected for field release, output remains review-only
  -> Uvicorn reload watches backend source but excludes ignored `.runtime` service installs

## Startup flow
app/main.py lifespan()
  -> creates AsyncIOMotorClient (app/core/database.py)
  -> reads connection string from app/core/config.py (.env)
  -> attempts init_beanie(document_models=[...]) with a bounded server-selection timeout
  -> records reference database availability and lets Farm State continue in degraded mode if MongoDB is unavailable
  -> app becomes ready to serve requests

### Windows universal-data bootstrap
`backend/scripts/setup_universal_data.ps1`
  -> downloads/extracts MongoDB only under ignored `backend/.runtime`
  -> starts `mongod` with explicitly quoted db/log paths so workspace names may contain spaces
  -> validates backend, ingests source data, then starts the optional API/n8n services

## Scheduled universal-data flow
n8n Schedule Trigger (daily 06:30 Asia/Kolkata)
  -> POST `/internal/universal-data/sync` with `X-Ingestion-Token`
  -> `app/scraping/service.py` creates an `ingestion_runs` record
  -> source adapters fetch paginated AGMARKNET/data.gov.in JSON and configured PIB MSP HTML
  -> parsers validate and normalize source-owned fields; missing fields stay null/empty
  -> bulk upserts use stable `source_record_id` keys for idempotency
  -> MongoDB receives `market_prices`, `msps`, and derived `crops`
  -> the ingestion run stores counts, source URLs, errors, and completed/partial/failed status

The same service can be invoked directly with `python -m app.scraping`; n8n schedules but does not contain parsing or database credentials.

### Marketplace directory flow
Approved HTTPS source registry in `MARKETPLACE_DIRECTORY_SOURCES_JSON`
  -> protected `POST /internal/universal-data/sync?sources=marketplace`
  -> `app/scraping/marketplace.py` extracts publisher-provided JSON-LD only
  -> stable source-record IDs bulk-upsert `marketplace_listings`
  -> `GET /marketplace/listings` supplies the React directory and MCP `search_marketplace_listings`
  -> `GET /marketplace/status` exposes configuration state without exposing stock or transacting

### Marketplace quote comparison flow
Farmer/supplier quote line items
  -> `POST /marketplace/compare-quotes`
  -> deterministic disclosed-cost total and per-currency rank
  -> MCP `compare_marketplace_quotes` / machinery / logistics helpers

### MSP versus mandi reference flow
PIB MSP ingestion + AGMARKNET mandi ingestion
  -> `GET /msp/compare-market?crop=...`
  -> newest MSP plus newest record per mandi, with source and procurement warning
  -> MCP `compare_msp_with_market`

### Device onboarding history flow
Field selector -> bounded `GET /v1/fields/{field_id}/observations/history`
  -> source-preserving moisture trend in `/device-setup`
  -> no-record state remains unknown

Listings carry source/fetch metadata and are discovery-only. The backend never creates a booking, purchase, sale, export filing or external contact action from this flow.

## Per-domain flow (fill in as each is built)

### Farm State
router: `app/routers/farm_state.py`
schema: `app/schemas/farm_state.py`
store: `app/farm_state/store.py`
notes: Profile, fields, crop cycles/stage events, soil tests, sensor readings, irrigation events, reminders, alerts, dashboards, and snapshot-backed reports are stored in the farmer's local SQLite file. Measurements and stage changes are inserted as history records; map and dashboard responses derive current state from the latest valid records.

### Farm finance ledger
Frontend Finance page or confirmation-gated MCP tool
  -> `POST /v1/ledger/entries` with a farmer-entered INR income/expense record
  -> FastAPI verifies optional field ownership and idempotency
  -> farmer-scoped SQLite `ledger_entries` persists the active record
  -> `GET /v1/ledger/entries` and `/v1/ledger/summary` return source-preserving records and active-only totals
  -> `PATCH /v1/ledger/entries/{id}` can void/reinstate a record without deleting history

This flow is bookkeeping only: it never triggers a payment, purchase, transfer, credit decision, tax calculation, or forecast.

### Device telemetry ingestion
Provisioned soil node
  -> `POST /v1/device-ingestion/observations` with bearer token, device/boot/sequence metadata, Modbus sample address and CRC state
  -> backend validates device-to-farmer/field scope and detects duplicate sequence
  -> farmer SQLite retains every packet/sample evidence record
  -> only CRC-valid samples with canonical units are copied into `sensor_readings`
  -> frontend/agent reads `/v1/device-ingestion/devices` for fresh/stale/rejected status

The gateway cannot use the farmer/agent write endpoint, the MCP agent never receives a device secret, and neither path controls a pump or valve.

### Crop-stage action proposal
Active crop cycle + canonical stage
  -> `GET /v1/fields/{field_id}/action-proposals`
  -> deterministic generic lifecycle rule creates a read-only proposal
  -> open task with matching title suppresses duplicate proposal
  -> farmer reviews proposal in UI or through agent explanation
  -> only an explicit `POST /v1/tasks` creates an auditable action record

Stage proposals never order inputs, prescribe chemicals, make a payment, or authorize irrigation/actuation.

### Controlled vision review flow
Farmer-confirmed crop photo
  -> local TF Hub/TFLite controlled-demo specialist
  -> image quality, score, and margin gates
  -> ranked disease candidates are persisted
  -> default OOD/field release gate returns `needs_expert_review`
  -> agent/UI shows limitations and requests a qualified review or better evidence

The controlled model cannot return a completed diagnosis by default because it has no approved unknown/OOD or farmer-phone field evaluation.

### Weather
router: `app/routers/weather.py`
service: `app/services/weather.py`
notes: The router calls the configured provider adapter, records normalized snapshots with source and freshness, and derives field weather alerts from stored provider data. Provider failures return an explicit 503 instead of synthetic weather.

### Diagnosis, advisor, and voice
router: `app/routers/assistants.py`
notes: Image uploads are validated, checksummed, and stored privately per farmer. `confirmed_crop` flows to `app/services/crop_health.py`; an explicitly enabled local router runs only a matching specialist. Its model/candidate envelope is persisted in SQLite. Missing models, unknown crops and low-confidence outputs fail closed to a review status; no treatment is generated by the vision model.

When `DIAGNOSIS_PROVIDER=local_tflite_demo`, the same route forwards only a
farmer-confirmed configured crop to `app/services/tflite_crop_health.py`. The
optional local dynamic-TFLite specialist returns evidence and limitations into
the SQLite diagnosis envelope; it cannot route crops or trigger action.
Before TFLite inference, the adapter rejects visibly unusable captures (small,
very dark, overexposed, or near-blank) into a retake/review state.
After a candidate clears score/margin gates, completion requires a deployment-
controlled release manifest with matching model/label checksums and explicit
passed independent-field, unknown/OOD, and agronomist-review evidence. A
missing/rejected/mismatched manifest remains `needs_expert_review`.

### Frontend merge flow
`src/api/client.js`
  -> attaches request ID, timeout, and `X-Farmer-ID` for Farm State calls
  -> normalizes HTTP, timeout, and offline failures into `ApiError`
`src/context/FarmDataContext.jsx`
  -> loads profile, fields, map summaries, and open alerts with independent settled results
  -> exposes refresh and mutation helpers to route components
`src/pages/*`
  -> renders backend values only when returned
  -> shows loading, empty, stale/source, error, or provider-unavailable state when a value is absent

### MCP agent write flow
Trusted launcher farmer ID + approved conversational tool call
  -> MCP server attaches `X-Farmer-ID`, request ID, and deterministic `Idempotency-Key`
  -> FastAPI validates the payload and checks the per-farmer SQLite idempotency record
  -> first request persists state and response; replay returns the original response; payload conflict returns 409
  -> MCP server returns a bounded result envelope with the backend request ID

Personal farm, sensor, diagnosis, advisor, reminder, alert, and report data stays within the SQLite file selected by the farmer identity boundary. Shared market/crop reference calls remain separate from Farm State calls.

### Storage connection check
Frontend Settings
  -> `GET /v1/storage-status` with `X-Farmer-ID`
  -> FastAPI opens the selected farmer SQLite store and returns its safe identity plus Mongo reference availability
 -> Settings also reads `GET /health` to surface a central-reference outage independently of farmer data

### Local TensorFlow Lite demonstration launch
`backend/scripts/run_local_tflite_demo.ps1`
  -> validates the model/label release manifest before setting process-local inference paths
  -> starts Uvicorn with source reload, passing `.runtime` exclusions as
     literal `--reload-exclude=<glob>` option values
  -> runtime MongoDB/n8n installation writes cannot become either watched
     source changes or expanded positional arguments

### Crop option evidence screen
Farmer-owned field + supplied season / prior crop / soil type
  -> `GET /v1/fields/{field_id}/crop-options` verifies field ownership in the
     farmer SQLite store
  -> reads central Mongo crop metadata only when reference storage is available
  -> evaluates visible compatibility checks, conflicts and absent evidence
  -> returns reviewable candidates to the frontend or MCP `get_crop_options`
     tool; no crop selection, input order or profitability claim is executed

### Diagnosis-feedback data-quality loop
Farmer receives a stored diagnosis result
  -> explicitly submits confirmation, correction or unknown feedback with
     optional sharing consent to `POST /v1/diagnoses/{id}/feedback`
  -> FastAPI verifies that diagnosis exists only in that farmer's SQLite store
  -> append-only feedback is stored with `reviewer_type=farmer`
  -> response marks it `requires_expert_review_and_separate_export`; no image
     transfer, dataset export, model retraining or treatment action occurs

### Market view models
router: `app/routers/market_price.py`
schema: `app/schemas/market_price.py`
model: `app/models/market_price.py`
notes: Dated Mongo reference records power latest-per-mandi summary, historical series, trends, and cost-assumption-aware mandi comparison. Net realisation is sale revenue minus transport, loading, unloading, market fees, storage, and expected spoilage, with assumptions returned in every comparison result.

### Farmer
router: app/routers/farmer.py
schema: app/schemas/farmer.py
model: app/models/farmer.py
notes: Full CRUD for central farmer reference records. field_ids is stored as a list of strings and is kept separate from any local client-side field data.

### Crop
router: app/routers/crop.py
schema: app/schemas/crop.py
model: app/models/crop.py
notes: Full CRUD for central crop reference records, including rotation and soil/water compatibility metadata.

### Disease
router: app/routers/disease.py
schema: app/schemas/disease.py
model: app/models/disease.py
notes: Full CRUD for central disease reference records, pairing crop-specific symptoms, severity labels, and treatment recommendations with future ML vision model outputs.

### Fertilizer
router: app/routers/fertilizer.py
schema: app/schemas/fertilizer.py
model: app/models/fertilizer.py
notes: Full CRUD for central fertilizer reference records, including crop compatibility, dosage, and price range metadata. Includes a `recommend_fertilizer()` path backed by `app/services/fertilizer_mutator.py` that ranks products using stored crop compatibility, optional type preference, subsidy, and budget fit.

### MarketPrice
router: app/routers/market_price.py
schema: app/schemas/market_price.py
model: app/models/market_price.py
notes: Full CRUD for central mandi price reference records. Includes a crop-scoped listing endpoint for prices across mandis and a computed compare endpoint that ranks mandis by net realisation.

### GovScheme
router: app/routers/gov_scheme.py
schema: app/schemas/gov_scheme.py
model: app/models/gov_scheme.py
notes: Full CRUD for central government scheme reference records. Includes a state-scoped listing endpoint that returns both state-specific and nationwide schemes, plus a `check_scheme_eligibility()` path backed by `app/services/gov_scheme_mutator.py` for PRD section 22 eligibility checks.

### MSP
router: app/routers/msp.py
schema: app/schemas/msp.py
model: app/models/msp.py
notes: Full CRUD for central MSP reference records. Includes a crop-scoped listing endpoint for MSP records tied to a crop.

### Seed
router: app/routers/seed.py
schema: app/schemas/seed.py
model: app/models/seed.py
notes: Full CRUD for central seed reference records, including crop-specific variety, certification, pricing, and supplier metadata. Includes a `recommend_seed()` path backed by `app/services/seed_mutator.py` that ranks varieties using stored crop match, optional zone match, and disease-resistance text matching.

### Sensor
router: app/routers/sensor.py
schema: app/schemas/sensor.py
model: app/models/sensor.py
notes: CONFIRM with team whether this belongs here or should move to
client-side SQLite per PRD section 8/29 - flagged as open question.

## Known open questions / boundaries
- Sensor data placement (central Mongo vs local SQLite) - needs team decision,
  see note above.
- Auth/JWT - deprioritized per team voice note (2026-08-15), revisit if time
  allows.
