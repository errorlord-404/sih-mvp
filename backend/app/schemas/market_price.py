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
    arrival_quintals: Optional[float] = None
    source: str = "manual"
    observed_at: Optional[datetime] = None
    fetched_at: Optional[datetime] = None
    min_price_per_quintal: Optional[float] = None
    max_price_per_quintal: Optional[float] = None
    variety: Optional[str] = None
    grade: Optional[str] = None
    source_record_id: Optional[str] = None
    source_url: Optional[str] = None


class MarketPriceUpdate(BaseModel):
    crop_name: Optional[str] = None
    mandi_name: Optional[str] = None
    price_per_quintal: Optional[float] = None
    date: Optional[datetime] = None
    state: Optional[str] = None
    district: Optional[str] = None
    arrival_quintals: Optional[float] = None
    source: Optional[str] = None
    observed_at: Optional[datetime] = None
    fetched_at: Optional[datetime] = None
    min_price_per_quintal: Optional[float] = None
    max_price_per_quintal: Optional[float] = None
    variety: Optional[str] = None
    grade: Optional[str] = None
    source_record_id: Optional[str] = None
    source_url: Optional[str] = None


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
    quantity_quintals: float = 1.0
    assumptions: dict[str, float | str]
    data_source: str
    observed_at: Optional[datetime] = None
    fetched_at: Optional[datetime] = None
    freshness_seconds: Optional[int] = None


class CompareMandisResponse(BaseModel):
    crop_name: str
    farmer_district: str
    farmer_state: str
    results: list[MandiComparisonResponse]


class MarketPriceSummaryItem(BaseModel):
    crop_name: str
    mandi_name: str
    state: str
    district: str
    price_per_quintal: float
    arrival_quintals: Optional[float] = None
    date: datetime
    source: str
    observed_at: Optional[datetime] = None
    fetched_at: Optional[datetime] = None
    freshness_seconds: Optional[int] = None


class MarketHistoryPoint(BaseModel):
    mandi_name: str
    date: datetime
    price_per_quintal: float
    arrival_quintals: Optional[float] = None
    source: str


class MarketTrendResponse(BaseModel):
    crop_name: str
    mandi_name: Optional[str] = None
    days: int
    current: Optional[float] = None
    delta: Optional[float] = None
    delta_percent: Optional[float] = None
    week_high: Optional[float] = None
    week_low: Optional[float] = None
    series: list[MarketHistoryPoint]
