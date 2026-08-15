from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class FertilizerCreate(BaseModel):
    name: str
    type: str
    crop_compatibility: List[str] = Field(default_factory=list)
    recommended_dosage: str
    price_range: str


class FertilizerUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    crop_compatibility: Optional[List[str]] = None
    recommended_dosage: Optional[str] = None
    price_range: Optional[str] = None


class FertilizerResponse(FertilizerCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
