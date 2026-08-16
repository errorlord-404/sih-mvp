<!-- refreshed: 2026-08-16 -->
# Architecture

**Analysis Date:** 2026-08-16

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  React/Vite farmer UI                                                    │
│  `src/main.jsx` → `src/App.jsx` → `src/routes/index.jsx`               │
├───────────────────────────────┬─────────────────────────────────────────┤
│  Layout and pages             │  i18n and local fixture state           │
│  `src/components/layout/`     │  `src/hooks/`, `src/data/`, `src/i18n/` │
└───────────────────────────────┴─────────────────────────────────────────┘
                   │ currently no HTTP client/API calls
                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FastAPI reference-data microservice                                    │
│  App/lifespan: `backend/app/main.py`                                    │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│ API routers          │ Pydantic schemas     │ Beanie document models    │
│ `backend/app/routers`│ `backend/app/schemas`│ `backend/app/models`      │
└──────────┬───────────┴──────────────────────┴───────────┬───────────────┘
           │                                               │
           ▼                                               ▼
┌──────────────────────────────┐             ┌────────────────────────────┐
│ Domain service abstraction   │             │ Central shared MongoDB      │
│ `backend/app/services/`      │             │ Motor/Beanie via            │
│ (scheme eligibility only)    │             │ `backend/app/core/database.py`│
└──────────────────────────────┘             └────────────────────────────┘
           ▲
           │ REST tool calls (planned connection)
┌─────────────────────────────────────────────────────────────────────────┐
│  SIH Harness / bundled Codex Rust fork                                  │
│  tool dispatch: `codex/codex-rs/core/src/tools/`                         │
│  intended farming handlers: `codex/codex-rs/core/src/tools/handlers/    │
│  kisansathi/` (not present)                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Vite bootstrap | Mounts React under strict mode. | `src/main.jsx` |
| Application composition | Provides router and language context. | `src/App.jsx` |
| Route tree | Declares the shared shell and all farmer-facing page paths. | `src/routes/index.jsx` |
| Presentation data | Supplies current dashboard, field, chat, navigation, and image fixtures; it is not a persistence or API layer. | `src/data/dashboard.js`, `src/data/fields.js`, `src/data/chat.js` |
| FastAPI composition root | Creates the ASGI app, owns lifespan database initialization, enables CORS, and registers each domain router. | `backend/app/main.py` |
| Database bootstrap | Builds the Motor client and registers all Beanie documents. | `backend/app/core/database.py` |
| Reference-data API | Exposes asynchronous CRUD endpoints and a small number of read/computation routes for farming domains. | `backend/app/routers/` |
| API contract layer | Defines create, partial-update, and response shapes independently from database documents. | `backend/app/schemas/` |
| Persistence layer | Maps farming reference entities to named MongoDB collections. | `backend/app/models/` |
| Eligibility policy seam | Defines a replaceable government-scheme eligibility interface and its Mongo implementation. | `backend/app/services/gov_scheme_mutator.py` |
| Harness runtime | Dispatches Codex tools; no KisanSathi handler module currently exists. | `codex/codex-rs/core/src/tools/handlers/mod.rs`, `codex/codex-rs/core/src/tools/registry.rs` |

## Pattern Overview

**Overall:** Layered modular monorepo: a presentation-only React application, a standalone FastAPI reference-data service, and a separately maintained embedded Codex Rust source tree intended to orchestrate REST-wrapped farming capabilities.

**Key Characteristics:**

- Keep central/shared agricultural reference data in the FastAPI service's MongoDB; backend guidance excludes per-farmer field, sensor, expense, harvest, and other offline personal data from this service. See `backend/AGENTS.md`, `backend/Decisions.md`, and `backend/docs/PRD.md`.
- Organize backend domains one-for-one across `models/`, `schemas/`, and `routers/`; register the document and router centrally in `backend/app/core/database.py` and `backend/app/main.py`.
- Keep the LLM/harness as an orchestrator of tool calls. The backend deliberately contains no LLM or agent implementation; the intended harness wrapper boundary is stated in `backend/AGENTS.md` and `backend/docs/PRD.md`.
- The checked-in React UI does not call the backend: it renders fixture modules from `src/data/`. Treat connecting it to HTTP as a separate integration concern.

## Layers

**Frontend application:**

- Purpose: Render the farmer dashboard, field tools, assistant, voice, market, report, and settings experiences.
- Location: `src/`.
- Contains: Route-level pages in `src/pages/`, reusable layout in `src/components/layout/`, shared language context in `src/hooks/useLanguage.jsx`, and visual styles in `src/index.css`.
- Depends on: React Router, i18next, local fixture modules, and browser `localStorage` for the selected language.
- Used by: The Vite document entry defined by `index.html`.

**Frontend content and localization:**

- Purpose: Supply current static content and Hindi/English translation resources.
- Location: `src/data/`, `src/constants/`, and `src/i18n/`.
- Contains: Mock farmer/field/forecast/chat records and navigation definitions, plus `en.json` and `hi.json` resources.
- Depends on: Nothing outside the frontend bundle.
- Used by: Page and layout components such as `src/pages/Dashboard.jsx` and `src/components/layout/DesktopSidebar.jsx`.

**HTTP composition and lifecycle:**

- Purpose: Construct and start the FastAPI application and its database lifecycle.
- Location: `backend/app/main.py`.
- Contains: `lifespan()`, CORS middleware, and router inclusion.
- Depends on: `backend/app/core/database.py` and all registered router modules.
- Used by: An ASGI server such as Uvicorn, expected to import `app.main:app` from the `backend/` working directory.

**Router / transport layer:**

- Purpose: Validate HTTP payloads, translate invalid IDs and missing documents to HTTP errors, perform simple domain queries, and serialize response contracts.
- Location: `backend/app/routers/`.
- Contains: One `APIRouter` module per supported entity: farmers, crops, diseases, fertilizers, market prices, government schemes, MSP records, and seeds.
- Depends on: Matching `models/` and `schemas/` modules; government schemes additionally depend on `backend/app/services/gov_scheme_mutator.py`.
- Used by: `backend/app/main.py`.

**Schema / contract layer:**

- Purpose: Define API-facing create, update, and response models, including `id` as a string instead of a Beanie ObjectId.
- Location: `backend/app/schemas/`.
- Contains: Pydantic `*Create`, `*Update`, and `*Response` models; market comparison and scheme eligibility request/response models.
- Depends on: Pydantic.
- Used by: Matching endpoint modules in `backend/app/routers/`.

**Model / persistence layer:**

- Purpose: Define Beanie documents and their MongoDB collection names.
- Location: `backend/app/models/`.
- Contains: `Farmer`, `Crop`, `Disease`, `Fertilizer`, `MarketPrice`, `GovScheme`, `MSP`, and `Seed` documents.
- Depends on: Beanie/Pydantic and initialization from `backend/app/core/database.py`.
- Used by: Routers and the government-scheme service.

**Domain service layer:**

- Purpose: Isolate policy that needs an implementation seam instead of keeping it wholly in a router.
- Location: `backend/app/services/gov_scheme_mutator.py`.
- Contains: The `GovSchemeMutator` abstract interface, `MongoGovSchemeMutator`, and dependency factory.
- Depends on: `backend/app/models/gov_scheme.py`.
- Used by: `backend/app/routers/gov_scheme.py` through FastAPI dependency injection.

**Harness tool layer:**

- Purpose: Execute registered Codex tools and, when farming handlers are added, wrap backend REST functions for agent use.
- Location: `codex/codex-rs/core/src/tools/`.
- Contains: General Codex registry, routing, lifecycle, and handler machinery.
- Depends on: The Rust workspace under `codex/codex-rs/`.
- Used by: The Codex CLI/harness runtime; `README.md` defines the intended KisanSathi extension location.

## Data Flow

### Current Backend CRUD Request Path

1. The ASGI app initializes its MongoDB/Beanie connection through `lifespan()` in `backend/app/main.py:18` and `init_db()` in `backend/app/core/database.py:15`.
2. An HTTP request reaches a domain router registered in `backend/app/main.py:31` through `backend/app/main.py:38`; FastAPI parses a schema such as `CropCreate` in `backend/app/schemas/crop.py:6`.
3. The router constructs or queries a Beanie `Document`, for example `create_crop()` in `backend/app/routers/crop.py:34` calls `insert()` on `Crop` from `backend/app/models/crop.py:7`.
4. Beanie delegates asynchronously through Motor to the configured central MongoDB client from `backend/app/core/database.py:16`.
5. The router converts the document to an explicit API response (`_to_response()` in `backend/app/routers/crop.py:13`) and FastAPI serializes JSON.

### Market-Comparison Flow

1. `GET /market-prices/compare/{crop_name}` enters `compare_mandis()` in `backend/app/routers/market_price.py:72` with farmer state and district query parameters.
2. The router queries all matching `MarketPrice` documents from the `market_prices` collection defined by `backend/app/models/market_price.py:6`.
3. Router-local constants and `_transport_cost()` in `backend/app/routers/market_price.py:17` calculate transport, fixed loading, and fee-derived net realisation, sort results descending, and return `CompareMandisResponse` from `backend/app/schemas/market_price.py:49`.

### Government-Scheme Eligibility Flow

1. `POST /gov-schemes/check-eligibility` reaches `check_scheme_eligibility()` in `backend/app/routers/gov_scheme.py:64`.
2. FastAPI injects the abstraction returned by `get_gov_scheme_mutator()` in `backend/app/services/gov_scheme_mutator.py:31`.
3. `MongoGovSchemeMutator` queries nationwide or matching-state `GovScheme` documents in `backend/app/services/gov_scheme_mutator.py:19` and the router serializes them to `SchemeEligibilityResponse`.

### UI Rendering Flow

1. `src/main.jsx:6` mounts `App`.
2. `src/App.jsx:6` nests `LanguageProvider` around the router provider.
3. `src/routes/index.jsx:18` selects an `AppShell` child route; page components import local fixture data such as `src/data/dashboard.js` and `src/data/fields.js`.

### SIH Harness and Future Ingestion Boundary

1. The project vision in `backend/docs/PRD.md` places the main LLM above a tool router and independent Backend/ML/IoT services; `backend/AGENTS.md` specifies that this FastAPI application supplies clean REST APIs for later Rust tool wrappers.
2. Add farming tool handlers only at the documented extension seam `codex/codex-rs/core/src/tools/handlers/kisansathi/`, then register them through the Codex tool system under `codex/codex-rs/core/src/tools/`. That KisanSathi directory is specified by `README.md` but is not currently present.
3. The repository has no Apify or n8n configuration, client, webhook, router, schema, model, or references. The appropriate boundary is external: Apify gathers source material, n8n normalizes/schedules it, and n8n calls a dedicated ingestion endpoint in the FastAPI transport layer. Put orchestration-specific write logic in a new service under `backend/app/services/`; validate an ingestion payload in a new schema under `backend/app/schemas/`; persist only confirmed central reference entities via models under `backend/app/models/`; expose an explicit router under `backend/app/routers/`; then register it in `backend/app/main.py`. This preserves the current router → schema → service/model → Mongo layering and keeps Apify/n8n out of React and Rust tool handlers.
4. Initial feed targets align with the existing reference collections `backend/app/models/market_price.py`, `backend/app/models/gov_scheme.py`, and `backend/app/models/msp.py`. The PRD requires real, or clearly marked mock, values for mandi prices, MSP, and government rules; ingestion must retain source and freshness metadata before those values are trusted by harness tools.

**State Management:**

- The frontend keeps component-local UI state and persists only the chosen language in browser `localStorage` from `src/hooks/useLanguage.jsx:13`; its farmer and farm state currently comes from fixtures.
- The backend has no application-level mutable cache. MongoDB is the central shared reference store, initialized once per FastAPI process.
- The intended system keeps each farmer's personal/offline operational data in client-side SQLite rather than this backend, as recorded in `backend/AGENTS.md` and `backend/Decisions.md`.

## Key Abstractions

**Document / schema / router triplet:**

- Purpose: Separate MongoDB persistence, HTTP request/response contracts, and endpoint behavior for each central-data domain.
- Examples: `backend/app/models/seed.py`, `backend/app/schemas/seed.py`, and `backend/app/routers/seed.py`; the same pattern applies for every registered domain.
- Pattern: Beanie `Document` plus Pydantic DTOs plus `APIRouter` CRUD handlers.

**Response mapper:**

- Purpose: Convert a Beanie document/ObjectId to a public Pydantic response with string `id`.
- Examples: `_to_response()` in `backend/app/routers/farmer.py:13`, `backend/app/routers/market_price.py:33`, and `backend/app/routers/gov_scheme.py:20`.
- Pattern: Router-local explicit mapper.

**ObjectId validator:**

- Purpose: Translate invalid document IDs into HTTP 400 before querying MongoDB.
- Examples: `_to_object_id()` in `backend/app/routers/crop.py:26` and `backend/app/routers/msp.py:24`.
- Pattern: Router-local `PydanticObjectId` conversion with `InvalidId`/`ValueError` handling.

**Government-scheme mutator:**

- Purpose: Provide a swappable eligibility-policy boundary.
- Examples: `GovSchemeMutator`, `MongoGovSchemeMutator`, and `get_gov_scheme_mutator()` in `backend/app/services/gov_scheme_mutator.py`.
- Pattern: Abstract base class resolved by FastAPI dependency injection.

**KisanSathi tool handler module:**

- Purpose: The intended Rust-facing one-capability-per-file wrapper around independent farming functionality.
- Examples: Target location is `codex/codex-rs/core/src/tools/handlers/kisansathi/`; no implementation exists at that path.
- Pattern: The project README requires one major farming capability per Rust module and central tool registration.

## Entry Points

**Frontend browser application:**

- Location: `index.html` and `src/main.jsx`.
- Triggers: Vite development server or production static bundle load.
- Responsibilities: Find `#root`, mount React, then hand rendering to `src/App.jsx`.

**Frontend routing application:**

- Location: `src/routes/index.jsx`.
- Triggers: React Router browser navigation.
- Responsibilities: Render `AppShell` and map all application URLs to their page components.

**FastAPI ASGI application:**

- Location: `backend/app/main.py`.
- Triggers: Uvicorn/another ASGI host imports `app`.
- Responsibilities: Open/close MongoDB client, configure CORS, and attach API route modules.

**Codex tool runtime:**

- Location: `codex/codex-rs/core/src/tools/mod.rs`, `codex/codex-rs/core/src/tools/registry.rs`, and `codex/codex-rs/core/src/tools/handlers/mod.rs`.
- Triggers: Codex CLI agent execution.
- Responsibilities: Resolve, invoke, observe, and route registered tools. It contains general-purpose tool handlers today; project-specific farming handlers are absent.

## Architectural Constraints

- **Threading:** The FastAPI persistence stack is asynchronous: route functions, `init_db()`, and Beanie/Motor operations are `async`; do not introduce synchronous database calls into `backend/app/` request paths.
- **Global state:** `settings` is a module-level Pydantic Settings instance in `backend/app/core/config.py:10`; `app` is a module-level FastAPI instance in `backend/app/main.py:26`; market calculation coefficients are module constants in `backend/app/routers/market_price.py:17`.
- **Database ownership:** This backend owns central shared reference collections only. Personal fields, sensor readings, expenses, harvests, and local offline workflows belong to a client-local SQLite store, not `backend/app/models/`.
- **Registration:** Every new central collection must have model/schema/router modules and must be added to both `backend/app/core/database.py:18` and `backend/app/main.py:31` through `backend/app/main.py:38`.
- **Harness isolation:** Do not put LLM or agent logic in the backend. Rust harness wrappers must be contained under the KisanSathi handler extension path described in `README.md`, rather than scattered through `codex/codex-rs/`.
- **Circular imports:** No circular import chain was detected among `backend/app/` modules.

## Anti-Patterns

### Bypassing the API contract with frontend fixture assumptions

**What happens:** Pages read farmer, field, forecast, and chat data directly from `src/data/` modules, while the FastAPI service has no matching HTTP consumption in `src/`.
**Why it's wrong:** UI data shapes can drift from the backend contracts and the frontend cannot reflect real shared reference data or tool results.
**Do this instead:** Add a dedicated client data-access boundary under `src/` when integration is authorized, map API responses deliberately, and keep page components consuming that boundary rather than importing backend-shaped fixtures.

### Treating an unregistered schema as a live API domain

**What happens:** `backend/app/schemas/sensors.py` defines sensor request DTOs, but no `backend/app/models/sensor.py`, `backend/app/routers/sensor.py`, or registration in `backend/app/main.py` / `backend/app/core/database.py` exists.
**Why it's wrong:** The file suggests a supported API that cannot be served and conflicts with the documented decision that per-farmer sensor data belongs in local SQLite.
**Do this instead:** Preserve sensor ownership in the client/offline data layer unless the team explicitly revises the database boundary; then add the full registered model/schema/router triplet.

### Coupling ingestion orchestration to agent tools or presentation code

**What happens:** Apify/n8n pipeline artifacts are absent, and placing future ingestion calls in `src/` or `codex/codex-rs/core/src/tools/handlers/` would bypass the backend's central-data boundary.
**Why it's wrong:** Tool handlers should consume validated REST capabilities, while React should display user-facing state; neither should own third-party source normalization or bulk persistence.
**Do this instead:** Keep Apify→n8n outside the repository application layers and terminate the feed at a dedicated FastAPI ingestion route/service/schema/model boundary inside `backend/app/`.

## Error Handling

**Strategy:** Routers explicitly return HTTP 400 for malformed ObjectIds and HTTP 404 when a queried document is absent; FastAPI/Pydantic handle request validation failures.

**Patterns:**

- Wrap `PydanticObjectId` conversion in `_to_object_id()` helpers, for example `backend/app/routers/disease.py:24`.
- Test a queried document for falsiness and raise `HTTPException` with a resource-specific detail, for example `backend/app/routers/fertilizer.py:53`.
- Use `exclude_unset=True` for partial updates before setting document attributes and saving, for example `backend/app/routers/seed.py:60`.

## Cross-Cutting Concerns

**Logging:** No explicit application logging configuration or logger calls were detected in `backend/app/` or `src/`.

**Validation:** Pydantic validates HTTP DTOs in `backend/app/schemas/`; Beanie/Pydantic validates persisted documents in `backend/app/models/`; FastAPI validates query parameters for the mandi comparison route in `backend/app/routers/market_price.py:72`.

**Authentication:** No authentication or authorization dependency/middleware is registered in `backend/app/main.py`. CORS is currently permissive for all origins, methods, and headers at `backend/app/main.py:27`.

---

*Architecture analysis: 2026-08-16*
