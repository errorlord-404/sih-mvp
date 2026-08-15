# ChangeLog

All notable changes to this service. Newest entry on top.
Format: `### YYYY-MM-DD HH:MM - short title`

---

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
### 2026-08-15 - Initial scaffold
**What changed:**
- Created FastAPI app skeleton with Beanie + Motor + MongoDB connection
- Added `Field` model as reference pattern

**Files touched:**
- `app/main.py`
- `app/core/database.py`

**Why:** See Decisions.md entry "Chose Beanie over raw Motor/PyMongo"

**Status:** Working, tested via /docs Swagger UI
