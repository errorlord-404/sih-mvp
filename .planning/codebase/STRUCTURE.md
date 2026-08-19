# Codebase Structure

**Analysis Date:** 2026-08-16

## Directory Layout

```text
[project-root]/
├── src/                              # React farmer application source
│   ├── components/layout/             # Responsive application shell/navigation
│   ├── constants/                     # Static translation-related constants
│   ├── data/                          # Current UI fixture data and navigation
│   ├── hooks/                         # React context/hook boundaries
│   ├── i18n/                          # i18next initialization and JSON resources
│   ├── pages/                         # Route-level screens and grouped page exports
│   ├── routes/                        # Browser router declaration
│   ├── App.jsx                        # Provider/router composition
│   ├── index.css                      # Global styles
│   └── main.jsx                       # React DOM entry point
├── public/                            # Static browser assets
├── backend/                           # Standalone FastAPI central-reference-data service
│   ├── app/
│   │   ├── core/                       # Settings and Motor/Beanie startup
│   │   ├── models/                     # Beanie MongoDB document definitions
│   │   ├── routers/                    # Domain HTTP endpoints
│   │   ├── schemas/                    # Pydantic API request/response DTOs
│   │   ├── services/                   # Domain behavior/replaceable policy seam
│   │   └── main.py                     # ASGI composition root
│   ├── docs/                           # SIH Harness product handoff/vision
│   ├── AGENTS.md                       # Mandatory backend scope and change rules
│   ├── ChangeLog.md                    # Backend change history
│   ├── Decisions.md                    # Architectural decisions
│   ├── Flow.md                         # Backend request/startup-flow map
│   └── requirements.txt                # Python dependency pins
├── codex/                              # Bundled OpenAI Codex Rust source tree / harness base
│   └── codex-rs/core/src/tools/         # Existing general tool runtime and handlers
├── .planning/codebase/                 # Generated architecture reference documents
├── package.json                        # Vite frontend scripts/dependencies
├── vite.config.js                      # Vite configuration
├── eslint.config.js                    # Frontend lint configuration
└── README.md                           # SIH-specific Rust handler placement guidance
```

## Directory Purposes

**`src/`:**

- Purpose: Browser client for the farmer experience.
- Contains: JSX components/pages, client routing, localization, static UI state, and CSS.
- Key files: `src/main.jsx`, `src/App.jsx`, `src/routes/index.jsx`, and `src/index.css`.

**`src/components/layout/`:**

- Purpose: Shared responsive chrome used by the route tree.
- Contains: `AppShell.jsx`, desktop/mobile navigation, headers, and mobile drawer components.
- Key files: `src/components/layout/AppShell.jsx`, `src/components/layout/DesktopSidebar.jsx`, and `src/components/layout/MobileBottomNav.jsx`.

**`src/pages/`:**

- Purpose: Screens selected by React Router.
- Contains: Default-exported page components and grouped named exports for closely related screen variants.
- Key files: `src/pages/Dashboard.jsx`, `src/pages/AIAssistant.jsx`, `src/pages/CorePages.jsx`, and `src/pages/FieldTools.jsx`.

**`src/data/`:**

- Purpose: Current in-bundle display fixtures and navigation metadata.
- Contains: Plain JavaScript exports for farmer/field/forecast/chat/image/navigation content.
- Key files: `src/data/dashboard.js`, `src/data/fields.js`, `src/data/chat.js`, and `src/data/navigation.js`.

**`src/hooks/`:**

- Purpose: Shared React behavior boundaries.
- Contains: Language provider and `useLanguage` hook.
- Key files: `src/hooks/useLanguage.jsx`.

**`src/i18n/`:**

- Purpose: Configure i18next and hold language resources.
- Contains: i18next initialization and English/Hindi JSON translation files.
- Key files: `src/i18n/index.js`, `src/i18n/en.json`, and `src/i18n/hi.json`.

**`src/routes/`:**

- Purpose: Single declaration of browser URL-to-page mappings.
- Contains: The `createBrowserRouter` configuration.
- Key files: `src/routes/index.jsx`.

**`public/`:**

- Purpose: Serve static assets without bundling them through JSX imports.
- Contains: Application icons.
- Key files: `public/favicon.svg` and `public/icons.svg`.

**`backend/app/`:**

- Purpose: FastAPI service for shared agricultural reference information only.
- Contains: ASGI composition, persistence startup, domain CRUD endpoints, DTOs, documents, and domain services.
- Key files: `backend/app/main.py`, `backend/app/core/database.py`, and `backend/app/core/config.py`.

**`backend/app/core/`:**

- Purpose: Backend-wide infrastructure setup.
- Contains: Settings loaded from the environment and Mongo/Beanie initialization.
- Key files: `backend/app/core/config.py` and `backend/app/core/database.py`.

**`backend/app/models/`:**

- Purpose: MongoDB persistence definitions.
- Contains: One Beanie `Document` per registered central collection.
- Key files: `backend/app/models/crop.py`, `backend/app/models/market_price.py`, `backend/app/models/gov_scheme.py`, and `backend/app/models/msp.py`.

**`backend/app/schemas/`:**

- Purpose: HTTP contract models and non-persisted request/response shapes.
- Contains: Per-domain Pydantic create/update/response classes and calculation/eligibility DTOs.
- Key files: `backend/app/schemas/market_price.py`, `backend/app/schemas/gov_scheme.py`, and `backend/app/schemas/sensors.py`.

**`backend/app/routers/`:**

- Purpose: REST endpoint modules, one per central reference-data domain.
- Contains: CRUD endpoints, market filtering/comparison, and scheme state/eligibility endpoints.
- Key files: `backend/app/routers/market_price.py`, `backend/app/routers/gov_scheme.py`, `backend/app/routers/crop.py`, and `backend/app/routers/farmer.py`.

**`backend/app/services/`:**

- Purpose: Domain behavior that benefits from a replaceable implementation.
- Contains: The current government-scheme eligibility abstraction and Mongo implementation.
- Key files: `backend/app/services/gov_scheme_mutator.py`.

**`backend/docs/`:**

- Purpose: Project vision and handoff documentation for the SIH Harness.
- Contains: Product requirements, system boundaries, planned tool functions, and demo scope.
- Key files: `backend/docs/PRD.md`.

**`codex/`:**

- Purpose: Separate checked-in Codex source tree used as the intended SIH Harness base, not part of the FastAPI service package or Vite source tree.
- Contains: Rust workspace, CLI, SDKs, and tooling.
- Key files: `codex/codex-rs/core/src/tools/registry.rs` and `codex/codex-rs/core/src/tools/handlers/mod.rs`.

**`.planning/codebase/`:**

- Purpose: Generated repository maps consumed by planning and execution workflows.
- Contains: Analysis documents such as `ARCHITECTURE.md` and `STRUCTURE.md`.
- Key files: `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/STRUCTURE.md`.

## Key File Locations

**Entry Points:**

- `index.html`: HTML document that supplies the browser root element for Vite.
- `src/main.jsx`: React DOM client bootstrap.
- `src/App.jsx`: Wraps routing with the language provider.
- `src/routes/index.jsx`: Client route configuration.
- `backend/app/main.py`: FastAPI ASGI application and router registration.
- `codex/codex-rs/core/src/tools/registry.rs`: General Codex tool-execution registry.

**Configuration:**

- `package.json`: Frontend scripts and npm dependencies.
- `vite.config.js`: Vite + React plugin configuration.
- `eslint.config.js`: ESLint flat configuration.
- `backend/requirements.txt`: Python runtime dependency pins.
- `backend/app/core/config.py`: Environment-backed MongoDB settings; `.env` is supported but its contents are not tracked/read by this map.
- `backend/AGENTS.md`: Backend scope, database ownership, naming, and maintenance rules.

**Core Logic:**

- `backend/app/routers/market_price.py`: Market-price CRUD, crop filtering, and mandi net-realisation comparison.
- `backend/app/routers/gov_scheme.py`: Government-scheme CRUD, state filter, and eligibility endpoint.
- `backend/app/services/gov_scheme_mutator.py`: Scheme eligibility policy interface/implementation.
- `backend/app/core/database.py`: Motor client and Beanie document registration.
- `src/pages/AIAssistant.jsx`: Farmer-facing assistant UI flow using fixture content.
- `src/pages/CorePages.jsx`: Grouped soil, weather, irrigation, market, and report page implementations.

**Testing:**

- No application test directory, test configuration, or frontend/backend test files were detected under `src/` or `backend/`.
- The bundled upstream Codex source tree has its own tests under `codex/codex-rs/`; treat those as harness-source tests, not SIH application test coverage.

## Naming Conventions

**Files:**

- React components and route pages use PascalCase `.jsx` filenames, for example `src/pages/VoiceAssistant.jsx` and `src/components/layout/AppShell.jsx`.
- Frontend hooks use a `use` prefix and camelCase `.jsx` filename, for example `src/hooks/useLanguage.jsx`.
- Frontend fixture and configuration modules use camelCase `.js` filenames, for example `src/data/localizedContent.js` and `src/constants/pageTranslations.js`.
- Python backend domain modules use lowercase snake_case filenames, for example `backend/app/routers/market_price.py` and `backend/app/services/gov_scheme_mutator.py`.
- A backend domain uses the same basename across model/schema/router directories: `backend/app/models/gov_scheme.py`, `backend/app/schemas/gov_scheme.py`, and `backend/app/routers/gov_scheme.py`.

**Directories:**

- Frontend directories group by technical role (`components`, `pages`, `data`, `hooks`, `routes`) rather than by backend domain.
- Backend directories enforce the layered names `core`, `models`, `schemas`, `routers`, and `services`.
- Custom SIH Rust tool directories must be grouped under `codex/codex-rs/core/src/tools/handlers/kisansathi/`, per `README.md`; that folder must be created only as part of authorized harness work.

## Where to Add New Code

**New Feature:**

- Primary browser screen: add a PascalCase page in `src/pages/`, then add its URL in `src/routes/index.jsx` and navigation metadata in `src/data/navigation.js` when it is navigable.
- Shared layout or navigation element: add it under `src/components/layout/` and compose it through `src/components/layout/AppShell.jsx`.
- Frontend language strings: add i18next resources in both `src/i18n/en.json` and `src/i18n/hi.json`; use `src/hooks/useLanguage.jsx` in components.
- Tests: no SIH application test location currently exists. Establish an explicit test configuration and co-located or dedicated test convention before adding tests.

**New Backend Reference-Data Domain:**

- Implementation: create the matching document at `backend/app/models/<domain>.py`, DTOs at `backend/app/schemas/<domain>.py`, and `APIRouter` at `backend/app/routers/<domain>.py`.
- Registration: add the document to `document_models` in `backend/app/core/database.py` and include the router in `backend/app/main.py`.
- Required documentation: update `backend/ChangeLog.md`, and update `backend/Decisions.md` / `backend/Flow.md` when the change introduces a non-obvious decision or a new connection, as required by `backend/AGENTS.md`.

**Apify+n8n Ingestion Pipeline (planned, no implementation exists):**

- Inbound HTTP boundary: create a dedicated ingestion router under `backend/app/routers/`, not under `src/` or `codex/`.
- Payload validation: place n8n-originated normalized payload DTOs under `backend/app/schemas/`.
- Mapping, deduplication, source attribution, and persistence orchestration: place this in an ingestion-specific service under `backend/app/services/`.
- Storage target: map only validated shared reference records to the relevant models in `backend/app/models/`—initially market prices, schemes, and MSP records—not farmer-private SQLite data.
- Harness consumption: after the ingestion-backed REST domain exists, create a tool wrapper within the intended `codex/codex-rs/core/src/tools/handlers/kisansathi/` seam and register it through the existing Codex tool system.

**New Harness Tool:**

- Rust implementation: one focused capability module under `codex/codex-rs/core/src/tools/handlers/kisansathi/`.
- HTTP capability consumed: use a backend REST endpoint in `backend/app/routers/`; do not embed Mongo access, Apify crawling, or n8n orchestration in the handler.
- Registration: follow the existing Rust handler and registry patterns in `codex/codex-rs/core/src/tools/handlers/mod.rs` and `codex/codex-rs/core/src/tools/registry.rs`.

**Utilities:**

- Frontend display-only helpers: colocate next to the small fixture/content module in `src/data/` or the consuming component if not broadly reusable.
- Backend domain helpers: keep a router-local helper only when it is strictly transport/computation-specific (such as `_transport_cost()` in `backend/app/routers/market_price.py`); create a service module under `backend/app/services/` for policy or an implementation that needs swapping/testing.

## Special Directories

**`backend/docs/`:**

- Purpose: SIH product and architecture handoff documentation.
- Generated: No.
- Committed: Yes.

**`codex/`:**

- Purpose: Large embedded/upstream Codex source tree that provides the planned agent harness substrate.
- Generated: No.
- Committed: Yes.

**`.planning/codebase/`:**

- Purpose: Generated current-state codebase reference documents.
- Generated: Yes.
- Committed: Repository workflow dependent; files are currently present in the working tree.

**`public/`:**

- Purpose: Static web assets served by Vite.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-08-16*
