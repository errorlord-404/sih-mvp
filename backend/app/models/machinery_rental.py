from datetime import datetime
from typing import Optional

from beanie import Document


class MachineryRental(Document):
    name: str
    category: str
    description: Optional[str] = None
    provider_name: Optional[str] = None
    location: Optional[str] = None
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
    # Legacy/reference-catalog aliases retained for backend-fastapi clients.
    hp: Optional[str] = None
    implements_included: Optional[str] = None
    owner_name: Optional[str] = None
    village: Optional[str] = None
    phone: Optional[str] = None
    reviews_count: Optional[int] = None
    available_status: Optional[str] = None

    class Settings:
        name = "machinery_rentals"
