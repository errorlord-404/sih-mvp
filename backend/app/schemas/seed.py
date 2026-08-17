from typing import Optional

from pydantic import BaseModel, ConfigDict


class SeedCreate(BaseModel):
    crop: str
    variety: str
    duration_days: str
    yield_potential: str
    disease_resistance: str
    recommended_zone: str


class SeedUpdate(BaseModel):
    crop: Optional[str] = None
    variety: Optional[str] = None
    duration_days: Optional[str] = None
    yield_potential: Optional[str] = None
    disease_resistance: Optional[str] = None
    recommended_zone: Optional[str] = None


class SeedResponse(SeedCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
