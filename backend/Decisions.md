# Decisions

Records WHY a non-obvious choice was made. Not every change needs an entry -
only ones where a reasonable person might ask "why did you do it this way?"

---

## Chose Beanie over raw Motor/PyMongo
**Date:** 2026-08-15
**Context:** Needed an ODM/data layer for MongoDB with FastAPI.
**Decision:** Beanie
**Alternatives considered:** Raw PyMongo (too much boilerplate, no async),
raw Motor (async but no schema validation)
**Trade-offs accepted:** Slightly more setup (needs init_beanie on startup),
but models double as both DB schema and Pydantic validation, matching
FastAPI's existing style.

## Dual database split (central Mongo + local SQLite)
**Date:** 2026-08-15
**Context:** Team debated single vs dual DB architecture.
**Decision:** Central MongoDB (shared reference data: crops, fertilizers,
schemes, MSP) + per-farmer local SQLite (personal farm/sensor/finance data),
per PRD section 8.
**Alternatives considered:** Single MongoDB for everything - rejected because
personal data needs to work offline (PRD section 29) and shared reference
data would be wastefully duplicated per-client otherwise.
**Trade-offs accepted:** This backend service only owns the central DB half;
sync logic between local SQLite and server is a separate concern owned by
another part of the team.

## MarketPrice route ordering
**Date:** 2026-08-15
**Context:** Added a crop-scoped listing endpoint alongside the ID-based lookup.
**Decision:** Keep `/by-crop/{crop_name}` above `/{market_price_id}` in the router so the static prefix resolves before the dynamic ID route.
**Alternatives considered:** Rely on route ordering implicitly or place only the ID route in this router.
**Trade-offs accepted:** Slightly more route definition clutter, but avoids accidental path matching ambiguity.
