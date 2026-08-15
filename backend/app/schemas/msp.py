from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class MSPCreate(BaseModel):
    crop_name: str
    msp_price_per_quintal: float
    season: str
    marketing_year: str
    procurement_centres: List[str]


class MSPUpdate(BaseModel):
    crop_name: Optional[str] = None
    msp_price_per_quintal: Optional[float] = None
    season: Optional[str] = None
    marketing_year: Optional[str] = None
    procurement_centres: Optional[List[str]] = None


class MSPResponse(MSPCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
