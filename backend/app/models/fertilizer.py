from typing import List

from beanie import Document
from pydantic import Field


class Fertilizer(Document):
    name: str
    type: str
    crop_compatibility: List[str] = Field(default_factory=list)
    recommended_dosage: str
    price_range: str

    class Settings:
        name = "fertilizers"
