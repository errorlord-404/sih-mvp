from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MarketPriceCreate(BaseModel):
    crop_name: str
    mandi_name: str
    price_per_quintal: float
    date: datetime
    state: str
    district: str


class MarketPriceUpdate(BaseModel):
    crop_name: Optional[str] = None
    mandi_name: Optional[str] = None
    price_per_quintal: Optional[float] = None
    date: Optional[datetime] = None
    state: Optional[str] = None
    district: Optional[str] = None


class MarketPriceResponse(MarketPriceCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
