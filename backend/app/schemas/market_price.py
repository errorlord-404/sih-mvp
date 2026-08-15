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


class MandiComparisonResponse(BaseModel):
    market_price_id: str
    crop_name: str
    mandi_name: str
    state: str
    district: str
    price_per_quintal: float
    transport_cost: float
    loading_cost: float
    unloading_cost: float
    market_fees: float
    storage_cost: float
    expected_spoilage: float
    sale_revenue: float
    net_realisation: float


class CompareMandisResponse(BaseModel):
    crop_name: str
    farmer_district: str
    farmer_state: str
    results: list[MandiComparisonResponse]
