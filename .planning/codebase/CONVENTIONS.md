# Coding Conventions

**Analysis Date:** 2026-08-16

## Naming Patterns

**Files:**
- Use PascalCase `.jsx` filenames for React pages and components, such as `src/pages/Dashboard.jsx` and `src/components/layout/AppShell.jsx`.
- Use lowercase snake_case `.py` filenames for backend domains, such as `backend/app/routers/market_price.py`, `backend/app/models/gov_scheme.py`, and `backend/app/schemas/gov_scheme.py`.
- Keep a backend domain's model, request/response schema, and router in same-named files under `backend/app/models/`, `backend/app/schemas/`, and `backend/app/routers/`.
- Use lowercase `.js` names for client data, constants, and setup modules, such as `src/data/localizedContent.js` and `src/i18n/index.js`.

**Functions:**
- Use camelCase for JavaScript functions, event handlers, and local helpers (`sendMessage`, `toggleListening`, `localizeField`) in `src/pages/AIAssistant.jsx`, `src/pages/VoiceAssistant.jsx`, and `src/data/fields.js`.
- Use snake_case for Python functions and route handlers (`create_farmer`, `list_market_prices_by_crop`) in `backend/app/routers/farmer.py` and `backend/app/routers/market_price.py`.
- Prefix backend router-only conversion and validation helpers with `_`, for example `_to_response`, `_to_object_id`, and `_transport_cost` in `backend/app/routers/market_price.py`.

**Variables:**
- Use camelCase in frontend state and props (`drawerOpen`, `setLanguage`, `fieldsForLanguage`) in `src/components/layout/AppShell.jsx` and `src/pages/AIAssistant.jsx`.
- Use snake_case in Python (`market_prices`, `farmer_state`, `net_realisation`) in `backend/app/routers/market_price.py`.
- Use UPPER_SNAKE_CASE for module-level Python constants, as in `TRANSPORT_WITHIN_DISTRICT` and `MARKET_FEE_RATE` in `backend/app/routers/market_price.py`.

**Types:**
- Name Python Beanie documents as singular PascalCase nouns (`Farmer`, `MarketPrice`) in `backend/app/models/`.
- Name API Pydantic schemas as `<Domain>Create`, `<Domain>Update`, and `<Domain>Response`, as in `backend/app/schemas/farmer.py`.
- Use `list[...]` in newer Python schemas where already present (`backend/app/schemas/market_price.py`); existing files otherwise use `typing.List` and `typing.Optional`. Preserve the local convention when editing an existing module.

## Code Style

**Formatting:**
- Frontend source has no configured formatter. Most files use two-space indentation and single quotes without semicolons, as in `src/components/layout/AppShell.jsx`; several files use semicolons, such as `src/routes/index.jsx` and `src/pages/VoiceAssistant.jsx`. Match the file being edited instead of reformatting unrelated code.
- Backend source uses four-space indentation, blank lines between imports/classes/functions, single-quoted Python strings only where needed, and descriptive multiline function signatures, as in `backend/app/routers/market_price.py`.
- No Python formatting configuration (`pyproject.toml`, `ruff.toml`, `setup.cfg`, or `.flake8`) is present under `backend/`.

**Linting:**
- Run `npm run lint` for frontend changes. `eslint.config.js` applies ESLint recommended rules, React Hooks recommended rules, and Vite React Refresh rules to `**/*.{js,jsx}`; `dist` is ignored.
- No backend lint command or Python linter configuration is detected. Follow the style of adjacent files and retain type annotations.

## Import Organization

**Order:**
1. Standard-library imports (for example, `from typing import List` in `backend/app/routers/farmer.py`).
2. Third-party imports (`beanie`, `fastapi`, `pydantic`) separated by a blank line.
3. Local absolute `app.*` imports in backend modules, separated by a blank line.
4. Frontend package imports followed by relative app imports; stylesheet imports may accompany the application entry point in `src/main.jsx`.

**Path Aliases:**
- Not detected. Frontend imports are relative (for example, `../data/fields.js` in `src/pages/MyFields.jsx`); backend imports from the `app` package (for example, `app.schemas.farmer`).

## Error Handling

**Patterns:**
- Convert invalid Mongo/Beanie object IDs at the router boundary and raise `HTTPException` with `status.HTTP_400_BAD_REQUEST`; see `_to_object_id` in `backend/app/routers/farmer.py`.
- Test lookup results explicitly and raise a 404 `HTTPException` with a domain-specific detail when absent; see `get_market_price` in `backend/app/routers/market_price.py`.
- Let FastAPI/Pydantic validate request payloads through typed parameters and `response_model` declarations rather than manually parsing data; see `create_gov_scheme` in `backend/app/routers/gov_scheme.py`.
- For abstract service interfaces, use `raise NotImplementedError` only in the abstract declaration, as in `backend/app/services/gov_scheme_mutator.py`.
- Frontend pages currently do not call remote APIs or implement user-visible error states; preserve local synchronous state/data patterns until an API boundary is introduced.

## Logging

**Framework:** No application logging framework or `console` logging pattern is detected in `src/` or `backend/app/`.

**Patterns:**
- Do not add ad-hoc logging as a substitute for FastAPI HTTP errors. Backend router failures currently communicate through `HTTPException` in `backend/app/routers/`.

## Comments

**When to Comment:**
- Add comments only for intent that is not evident from the code, such as the CORS temporary rationale in `backend/app/main.py` or the interface-stability rationale in `backend/app/services/gov_scheme_mutator.py`.
- Keep route grouping comments concise, as in `src/routes/index.jsx`; do not restate JSX or a function name.

**JSDoc/TSDoc:**
- Not used. Python classes and functions do not currently use docstrings. Prefer clear names and typed schemas consistent with `backend/app/schemas/`.

## Function Design

**Size:**
- Keep CRUD route handlers focused on one persistence operation plus conversion, as in `backend/app/routers/farmer.py`.
- Extract reusable backend router logic into private helpers or a service when it has an independent responsibility, as `_transport_cost` and `GovSchemeMutator` demonstrate in `backend/app/routers/market_price.py` and `backend/app/services/gov_scheme_mutator.py`.
- Frontend page files include local presentational helpers and page behavior in the same module (for example, `Card`/`Metric` in `src/pages/CorePages.jsx`); retain that local-helper pattern for page-specific UI.

**Parameters:**
- Receive validated Pydantic request models as `payload` and typed primitive path/query values in FastAPI handlers, as in `backend/app/routers/gov_scheme.py`.
- Destructure React props in component parameters and use callback prop names beginning with `on` (`onMenuClick`, `onClose`) in `src/components/layout/`.

**Return Values:**
- Return explicit Pydantic response schemas from API helpers and handlers, and stringify document `id` values in `_to_response` helpers. See `backend/app/routers/farmer.py`.
- Export React components as default exports for one-component files; use named exports for multiple page views or utilities, as in `src/pages/FieldTools.jsx` and `src/data/navigation.js`.

## Module Design

**Exports:**
- Use a default export for the primary frontend application/page/layout component (`src/App.jsx`, `src/pages/Dashboard.jsx`, `src/components/layout/Header.jsx`).
- Use named exports for data objects, hooks, route configuration, and modules containing multiple page components (`src/data/dashboard.js`, `src/hooks/useLanguage.jsx`, `src/routes/index.jsx`).
- Backend modules expose classes/functions directly; routers expose a module-level `router` object for inclusion in `backend/app/main.py`.

**Barrel Files:**
- `__init__.py` files under `backend/app/` are empty package markers. Do not add backend barrel re-exports.
- No frontend barrel files are used; import from the defining file.

---

*Convention analysis: 2026-08-16*
