from datetime import datetime
from typing import Any, Optional

from beanie import Document
from pydantic import Field
from pymongo import IndexModel


class MarketplaceListing(Document):
    """A source-attributed discovery record, never a booking or purchase."""

    source_record_id: str
    listing_type: str = Field(description="machinery, seed, fertilizer, logistics, buyer, or exporter")
    title: str
    category: Optional[str] = None
    provider_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    location_point: Optional[dict[str, Any]] = None
    service_radius_km: Optional[float] = Field(default=None, ge=0)
    geocode_source: Optional[str] = None
    verified_at: Optional[datetime] = None
    price_amount: Optional[float] = Field(default=None, ge=0)
    price_currency: str = "INR"
    price_unit: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    listing_url: Optional[str] = None
    source: str
    source_url: str
    observed_at: Optional[datetime] = None
    fetched_at: datetime

    class Settings:
        name = "marketplace_listings"
        indexes = [
            IndexModel("source_record_id", unique=True),
            "listing_type",
            "category",
            "state",
            "district",
            IndexModel([("location_point", "2dsphere")], sparse=True),
            "fetched_at",
        ]
