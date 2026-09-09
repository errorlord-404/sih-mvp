# MVP implementation checkpoint — 9 September 2026

This checkpoint records the implementation completed after
`MVP_INITIAL_DEMO_READINESS_PLAN_2026_09_09.md`. It is intentionally separate
from the existing dirty session files so a later agent can resume safely.

## Completed in this slice

- Added `src/lib/location.js` to normalize display locations and select field
  coordinates without treating `Pune, Maharashtra (local demo)` as a state.
- Added `FarmBoundaryMap` using Leaflet/OpenStreetMap, backend GeoJSON,
  computed centroids, fit-to-bounds and safe invalid-geometry handling.
- Added `NearbyServicesMap` for selected-farm/provider markers, radius circle,
  marker-card selection and map/list workflows.
- Added marketplace and machinery nearby API clients and connected both screens
  to a selected field/profile location, radius and Map/List mode.
- Extended shared Mongo listing/rental contracts with optional coordinates,
  service radius, geocode provenance, verification time and sparse geospatial
  index declarations.
- Added bounded `/marketplace/nearby` and `/machinery-rentals/nearby` endpoints
  with distance sorting and explicit no-coordinate fallback behavior.
- Normalized machinery/marketplace administrative filters.
- Fixed `/gov-schemes/by-state/{state}` for the installed Beanie version and
  made nationwide demo records match normalized state searches.
- Added Pune coordinates to the local demo machinery and marketplace records.
- Added `npm run demo:desktop`, backed by `scripts/start-demo.ps1`, which
  starts/validates Mongo, idempotently seeds demo data, starts FastAPI on 8001,
  starts Vite with matching URLs and launches Electron with Codex context.

## Evidence

- `npm run lint`: passed with no warnings.
- `npm run build`: passed; existing Vite bundle-size warning remains.
- `npm run test:ui -- --run`: 10 files, 17 tests passed.
- `python -m pytest backend/tests -q`: 48 passed after the geo contract tests; only existing dependency
  deprecation warning.
- PowerShell AST parse of `scripts/start-demo.ps1`: passed.
- Fresh backend smoke on port 8013 with seeded Mongo:
  - `/health`: `status=ok`, `farm_state=available`, `reference_database=available`.
  - `/gov-schemes/by-state/Maharashtra`: 3 records.
  - `/machinery-rentals/nearby?lat=18.5204&lon=73.8567&radius_km=25`: 1 demo
    rental at `0.0 km`.
  - `/marketplace/nearby?lat=18.5204&lon=73.8567&radius_km=25`: 1 demo
    listing at `0.0 km`.

## Known limitations

- The repository is intentionally dirty. Existing changes in `FieldTools.jsx`,
  `Marketplace.jsx`, `MachineryRentals.jsx`, backend modules and documentation
  predate this checkpoint. Do not reset, clean or overwrite them.
- The current nearby implementation calculates Haversine distance over a
  bounded Mongo result set. The declared 2dsphere indexes are preparation for
  a native `$near` query after ingestion volume justifies it.
- Existing seeded provider records are local-demo references, not live stock,
  prices, availability or verified providers.
- The Electron launcher has been syntax-checked but has not yet been run as a
  full fresh-machine UAT in this checkpoint.
- Codex tool parity for the new nearby endpoints is still pending.
- Physical actuation, production authentication, offline mobile sync and
  field-released crop-health inference remain out of scope for this MVP slice.

## Next task

Run a fresh `npm run demo:desktop` UAT, verify the four screenshot workflows in
Electron, then add MCP read tools for selected-field map/nearby discovery and
their stdio contract tests. Keep the same structured location and provenance
contracts; do not reintroduce display-string parsing in a new client.
