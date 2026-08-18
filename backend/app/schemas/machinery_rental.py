from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MachineryRentalResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    provider_name: str
    location: str
    district: Optional[str] = None
    state: Optional[str] = None
    distance_km: Optional[float] = None
    hourly_rate: Optional[float] = Field(default=None, ge=0)
    daily_rate: Optional[float] = Field(default=None, ge=0)
    availability_status: str
    contact_phone: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    source: str
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    observed_at: Optional[datetime] = None
    fetched_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
