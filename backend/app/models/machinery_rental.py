from datetime import datetime
from typing import Optional

from beanie import Document


class MachineryRental(Document):
    name: str
    category: str
    description: Optional[str] = None
    provider_name: str
    location: str
    district: Optional[str] = None
    state: Optional[str] = None
    distance_km: Optional[float] = None
    hourly_rate: Optional[float] = None
    daily_rate: Optional[float] = None
    availability_status: str = "unknown"
    contact_phone: Optional[str] = None
    rating: Optional[float] = None
    source: str = "manual"
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    observed_at: Optional[datetime] = None
    fetched_at: Optional[datetime] = None

    class Settings:
        name = "machinery_rentals"
