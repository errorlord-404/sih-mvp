# Flow.md

Describes how requests move through this service, so a bug can be traced to
"before" or "after" a given point. Update whenever you add a new module or
change how existing ones connect.

---

## High-level request flow
Client request
  -> FastAPI router (app/routers/*.py)
    -> validates against schema (app/schemas/*.py)
  -> Beanie Document method (app/models/*.py)
    -> Motor driver
  -> MongoDB (central, shared reference DB)
  -> response serialized back through schema
  -> JSON response to client

## Startup flow
app/main.py lifespan()
  -> creates AsyncIOMotorClient (app/core/database.py)
  -> reads connection string from app/core/config.py (.env)
  -> init_beanie(document_models=[...]) registers every model
  -> app becomes ready to serve requests

## Per-domain flow (fill in as each is built)

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

### Fertilizer
router: app/routers/fertilizer.py
schema: app/schemas/fertilizer.py
model: app/models/fertilizer.py
notes: Full CRUD for central fertilizer reference records, including crop compatibility, dosage, and price range metadata.

### MarketPrice
router: app/routers/market_price.py
schema: app/schemas/market_price.py
model: app/models/market_price.py
notes: Full CRUD for central mandi price reference records. Includes a crop-scoped listing endpoint for prices across mandis.

### GovScheme
router: app/routers/gov_scheme.py
schema: app/schemas/gov_scheme.py
model: app/models/gov_scheme.py
notes: Full CRUD for central government scheme reference records. Includes a state-scoped listing endpoint that returns both state-specific and nationwide schemes.

### MSP
router: app/routers/msp.py
schema: app/schemas/msp.py
model: app/models/msp.py
notes: Full CRUD for central MSP reference records. Includes a crop-scoped listing endpoint for MSP records tied to a crop.

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
