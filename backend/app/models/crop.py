from typing import List

from beanie import Document
from pydantic import Field


class Crop(Document):
    name: str
    season: str
    water_requirement: str
    soil_compatibility: List[str] = Field(default_factory=list)
    previous_crop_compatibility: List[str] = Field(default_factory=list)
    avg_yield_per_acre: float
    avg_price_per_quintal: float

    class Settings:
        name = "crops"
