# ChangeLog

All notable changes to this service. Newest entry on top.
Format: `### YYYY-MM-DD HH:MM - short title`

---

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
