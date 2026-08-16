# Testing Patterns

**Analysis Date:** 2026-08-16

## Test Framework

**Runner:**
- Not detected for the application. `package.json` has no test script or test dependency, and `backend/requirements.txt` has no test runner or HTTP test-client dependency.
- Config: Not detected; no Jest, Vitest, Playwright, pytest, tox, or unittest configuration exists outside the independent `codex/` source tree.

**Assertion Library:**
- Not detected for `src/` or `backend/app/`.

**Run Commands:**
```bash
npm run lint          # Existing frontend static check; not a test runner
npm run build         # Existing frontend production build; not a test runner
# No application test, watch, or coverage command is configured.
```

## Test File Organization

**Location:**
- No application test files are present under `src/` or `backend/`.
- The checked-in `codex/` directory has its own unrelated Rust/Python/TypeScript test suites and package manifests. It is not the Kisan Sathi frontend/FastAPI test setup and should not establish testing conventions for `src/` or `backend/app/`.

**Naming:**
- Not established. Use framework-standard names only after adding a runner; currently no test-discovery convention exists for the application.

**Structure:**
```
Not established for `src/` or `backend/`.
```

## Test Structure

**Suite Organization:**
```typescript
// Not applicable: no frontend or backend application test suites exist.
```

**Patterns:**
- No setup, teardown, assertion, fixture, or test isolation pattern is implemented for the application.
- Backend behavior is organized around pure router helpers (`_to_object_id`, `_to_response`, `_transport_cost`) and async CRUD handlers in `backend/app/routers/`; tests added later should exercise these boundaries without changing their public route contracts.

## Mocking

**Framework:** Not detected.

**Patterns:**
```typescript
// Not applicable: the application has no mock setup or test files.
```

**What to Mock:**
- No established application convention. Any future FastAPI router tests will need an isolated substitute for Beanie/Motor operations invoked from `backend/app/routers/` and `backend/app/core/database.py`.

**What NOT to Mock:**
- No established convention. Keep response-schema serialization behavior in `backend/app/schemas/` and HTTP status/error behavior in `backend/app/routers/` under direct test rather than replacing them with mocks.

## Fixtures and Factories

**Test Data:**
```typescript
// Not applicable: no fixtures, factories, or application test data are present.
```

**Location:**
- Not established. The product's current UI sample data is stored in `src/data/` (`fields.js`, `dashboard.js`, `chat.js`) but is runtime display data, not test fixtures.

## Coverage

**Requirements:** None enforced. No coverage configuration, threshold, or reporting command is present in `package.json` or `backend/` configuration.

**View Coverage:**
```bash
# Not available: no application coverage command is configured.
```

## Test Types

**Unit Tests:**
- Not used. Candidate isolated logic currently lives in `src/data/localizedContent.js`, `src/data/fields.js`, `src/hooks/useLanguage.jsx`, `backend/app/routers/market_price.py`, and `backend/app/services/gov_scheme_mutator.py`.

**Integration Tests:**
- Not used. No tests cover FastAPI routes in `backend/app/routers/`, app lifespan/database initialization in `backend/app/main.py`, or the React route tree in `src/routes/index.jsx`.

**E2E Tests:**
- Not used. No Playwright, Cypress, or equivalent configuration is present for the application.

## Common Patterns

**Async Testing:**
```python
# Not applicable: no async application tests are implemented.
# Backend code requiring async coverage includes `create_farmer` and
# `list_market_prices` in `backend/app/routers/farmer.py` and
# `backend/app/routers/market_price.py`.
```

**Error Testing:**
```python
# Not applicable: no application error tests are implemented.
# Existing error contract: invalid IDs raise HTTP 400 and missing documents
# raise HTTP 404 in `backend/app/routers/farmer.py`.
```

---

*Testing analysis: 2026-08-16*
