from typing import List

from beanie import Document
from pydantic import Field


class Seed(Document):
    name: str
    crop_name: str
    variety: str
    price: float
    certifications: List[str] = Field(default_factory=list)
    supplier_info: str

    class Settings:
        name = "seeds"
