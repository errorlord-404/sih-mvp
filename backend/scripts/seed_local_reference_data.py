"""Seed the local MongoDB shared-reference database for an offline demo.

This script deliberately creates *labelled local demo records*, not live mandi
prices, official MSP values, supplier listings, or eligibility decisions.  It
is safe to run repeatedly: every record is upserted by a stable local ID (or a
demo-only name for legacy collections).

Run from ``backend`` after MongoDB is running::

    python scripts/seed_local_reference_data.py
"""

from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.database import init_db
from app.models.crop import Crop
from app.models.fertilizer import Fertilizer
from app.models.gov_scheme import GovScheme
from app.models.machinery_rental import MachineryRental
from app.models.market_price import MarketPrice
from app.models.marketplace_listing import MarketplaceListing
from app.models.msp import MSP
from app.models.seed import Seed


SOURCE = "local_demo_seed_not_live"
NOTE = "LOCAL DEMO REFERENCE ONLY — verify current terms, stock, prices and eligibility at the linked official source."


def now() -> datetime:
    return datetime.now(timezone.utc)


async def upsert_source_records(model, records: list[dict]) -> int:
    collection = model.get_pymongo_collection()
    for record in records:
        await collection.update_one(
            {"source_record_id": record["source_record_id"]},
            {"$set": record},
            upsert=True,
        )
    return len(records)


async def upsert_named_records(model, records: list[dict]) -> int:
    """Use the demo-marked name as an id for older models without provenance."""
    collection = model.get_pymongo_collection()
    for record in records:
        await collection.update_one({"name": record["name"]}, {"$set": record}, upsert=True)
    return len(records)


async def main() -> None:
    timestamp = now()
    client = await init_db()
    try:
        counts: dict[str, int] = {}
        counts["crops"] = await upsert_source_records(
            Crop,
            [
                {
                    "source_record_id": "local-demo-crop-paddy",
                    "name": "Paddy (local demo reference)",
                    "season": "Kharif",
                    "water_requirement": "Review locally; no irrigation volume is inferred.",
                    "soil_compatibility": ["Verify pH, EC, drainage and local agronomist guidance."],
                    "previous_crop_compatibility": ["Use crop-rotation review; this is not a prescription."],
                    "source": SOURCE,
                    "source_url": "https://icar.gov.in/",
                    "fetched_at": timestamp,
                },
                {
                    "source_record_id": "local-demo-crop-wheat",
                    "name": "Wheat (local demo reference)",
                    "season": "Rabi",
                    "water_requirement": "Review locally; no irrigation volume is inferred.",
                    "soil_compatibility": ["Verify soil test and local agronomist guidance."],
                    "previous_crop_compatibility": ["Use crop-rotation review; this is not a prescription."],
                    "source": SOURCE,
                    "source_url": "https://icar.gov.in/",
                    "fetched_at": timestamp,
                },
                {
                    "source_record_id": "local-demo-crop-tomato",
                    "name": "Tomato (local demo reference)",
                    "season": "Season varies by local production system",
                    "water_requirement": "Review locally; no irrigation volume is inferred.",
                    "soil_compatibility": ["Verify soil test, drainage and local agronomist guidance."],
                    "previous_crop_compatibility": ["Use crop-rotation review; this is not a prescription."],
                    "source": SOURCE,
                    "source_url": "https://icar.gov.in/",
                    "fetched_at": timestamp,
                },
            ],
        )
        counts["market_prices"] = await upsert_source_records(
            MarketPrice,
            [
                {
                    "source_record_id": "local-demo-price-paddy-pune",
                    "crop_name": "Paddy (local demo reference)",
                    "mandi_name": "Demo Pune mandi — NOT LIVE",
                    "price_per_quintal": 2200.0,
                    "min_price_per_quintal": 2000.0,
                    "max_price_per_quintal": 2400.0,
                    "date": timestamp,
                    "observed_at": timestamp,
                    "fetched_at": timestamp,
                    "state": "Maharashtra",
                    "district": "Pune",
                    "source": SOURCE,
                    "source_url": "https://agmarknet.gov.in/",
                },
                {
                    "source_record_id": "local-demo-price-paddy-nashik",
                    "crop_name": "Paddy (local demo reference)",
                    "mandi_name": "Demo Nashik mandi — NOT LIVE",
                    "price_per_quintal": 2150.0,
                    "min_price_per_quintal": 1950.0,
                    "max_price_per_quintal": 2350.0,
                    "date": timestamp,
                    "observed_at": timestamp,
                    "fetched_at": timestamp,
                    "state": "Maharashtra",
                    "district": "Nashik",
                    "source": SOURCE,
                    "source_url": "https://agmarknet.gov.in/",
                },
                {
                    "source_record_id": "local-demo-price-wheat-pune",
                    "crop_name": "Wheat (local demo reference)",
                    "mandi_name": "Demo Pune mandi — NOT LIVE",
                    "price_per_quintal": 2500.0,
                    "min_price_per_quintal": 2300.0,
                    "max_price_per_quintal": 2700.0,
                    "date": timestamp,
                    "observed_at": timestamp,
                    "fetched_at": timestamp,
                    "state": "Maharashtra",
                    "district": "Pune",
                    "source": SOURCE,
                    "source_url": "https://agmarknet.gov.in/",
                },
            ],
        )
        counts["msps"] = await upsert_source_records(
            MSP,
            [
                {
                    "source_record_id": "local-demo-msp-paddy",
                    "crop_name": "Paddy (local demo reference)",
                    "msp_price_per_quintal": 2300.0,
                    "season": "Demo only",
                    "marketing_year": "DEMO-NOT-OFFICIAL",
                    "procurement_centres": ["Verify a current procurement centre with the relevant state agency."],
                    "source": SOURCE,
                    "source_url": "https://fw.pib.gov.in/",
                    "fetched_at": timestamp,
                },
                {
                    "source_record_id": "local-demo-msp-wheat",
                    "crop_name": "Wheat (local demo reference)",
                    "msp_price_per_quintal": 2400.0,
                    "season": "Demo only",
                    "marketing_year": "DEMO-NOT-OFFICIAL",
                    "procurement_centres": ["Verify a current procurement centre with the relevant state agency."],
                    "source": SOURCE,
                    "source_url": "https://fw.pib.gov.in/",
                    "fetched_at": timestamp,
                },
            ],
        )
        counts["seeds"] = await upsert_named_records(
            Seed,
            [
                {
                    "name": "Paddy demo variety — NOT A PRODUCT LISTING",
                    "crop": "Paddy (local demo reference)",
                    "variety": "Demo variety — verify certified local availability",
                    "duration_days": "Verify locally",
                    "yield_potential": "Not estimated in this demo",
                    "disease_resistance": "Refer to authorised seed label and extension service",
                    "recommended_zone": NOTE,
                },
                {
                    "name": "Wheat demo variety — NOT A PRODUCT LISTING",
                    "crop": "Wheat (local demo reference)",
                    "variety": "Demo variety — verify certified local availability",
                    "duration_days": "Verify locally",
                    "yield_potential": "Not estimated in this demo",
                    "disease_resistance": "Refer to authorised seed label and extension service",
                    "recommended_zone": NOTE,
                },
            ],
        )
        counts["fertilizers"] = await upsert_named_records(
            Fertilizer,
            [
                {
                    "name": "Soil-test consultation placeholder — NOT A FERTILIZER OFFER",
                    "type": "Demo reference",
                    "bag_size": "N/A",
                    "subsidized_mrp": 0.0,
                    "govt_subsidy_per_bag": 0.0,
                    "dosage_per_acre": "No dosage: obtain a current soil test and qualified recommendation.",
                    "suitable_crops": ["Paddy (local demo reference)", "Wheat (local demo reference)", "Tomato (local demo reference)"],
                }
            ],
        )
        counts["gov_schemes"] = await upsert_named_records(
            GovScheme,
            [
                {
                    "name": "PM-KISAN (local demo reference — verify current terms)",
                    "description": NOTE,
                    "eligibility_criteria": ["Eligibility is not evaluated by this demo. Use the official portal."],
                    "benefits": "Verify current benefits and payment status at the official portal.",
                    "required_documents": ["Refer to the official portal / local facilitation centre."],
                    "application_steps": ["Open official source", "Verify current eligibility", "Follow the official application process"],
                    "official_source_url": "https://pmkisan.gov.in/",
                    "applicable_states": ["India — verify local applicability"],
                },
                {
                    "name": "PMFBY (local demo reference — verify current terms)",
                    "description": NOTE,
                    "eligibility_criteria": ["Eligibility and enrolment windows are not evaluated by this demo."],
                    "benefits": "Verify current insurance cover, premium and enrolment details at the official portal.",
                    "required_documents": ["Refer to the official portal / authorised enrolment channel."],
                    "application_steps": ["Open official source", "Verify the current season and enrolment window", "Use an authorised channel"],
                    "official_source_url": "https://pmfby.gov.in/",
                    "applicable_states": ["India — verify local applicability"],
                },
                {
                    "name": "Soil Health Card (local demo reference — verify current terms)",
                    "description": NOTE,
                    "eligibility_criteria": ["Check local sampling and service availability through the official portal."],
                    "benefits": "Verify the current soil-testing service process with local agriculture authorities.",
                    "required_documents": ["Refer to the official portal / local agriculture office."],
                    "application_steps": ["Open official source", "Locate the relevant local service", "Follow official sampling guidance"],
                    "official_source_url": "https://soilhealth.dac.gov.in/",
                    "applicable_states": ["India — verify local availability"],
                },
            ],
        )
        counts["machinery_rentals"] = await upsert_named_records(
            MachineryRental,
            [
                {
                    "name": "Demo tractor directory record — contact verification required",
                    "category": "tractor",
                    "description": NOTE,
                    "provider_name": "Demo directory reference — not a provider",
                    "location": "Pune, Maharashtra",
                    "district": "Pune",
                    "state": "Maharashtra",
                    "latitude": 18.5204,
                    "longitude": 73.8567,
                    "location_point": {"type": "Point", "coordinates": [73.8567, 18.5204]},
                    "availability_status": "unknown",
                    "source": SOURCE,
                    "source_url": "https://agrimachinery.nic.in/",
                    "fetched_at": timestamp,
                }
            ],
        )
        counts["marketplace_listings"] = await upsert_source_records(
            MarketplaceListing,
            [
                {
                    "source_record_id": "local-demo-marketplace-machinery-directory",
                    "listing_type": "machinery",
                    "title": "Demo machinery discovery record — NOT A BOOKING",
                    "category": "tractor",
                    "description": NOTE,
                    "location": "Pune, Maharashtra",
                    "district": "Pune",
                    "state": "Maharashtra",
                    "latitude": 18.5204,
                    "longitude": 73.8567,
                    "location_point": {"type": "Point", "coordinates": [73.8567, 18.5204]},
                    "listing_url": "https://agrimachinery.nic.in/",
                    "source": SOURCE,
                    "source_url": "https://agrimachinery.nic.in/",
                    "fetched_at": timestamp,
                }
            ],
        )
        print("Local MongoDB demo seed complete (all records are NOT LIVE):")
        for collection, count in counts.items():
            print(f"  {collection}: {count} upserted")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
