from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SeedCreate(BaseModel):
    name: str
    crop_name: str
    variety: str
    price: float
    certifications: List[str] = Field(default_factory=list)
    supplier_info: str


class SeedUpdate(BaseModel):
    name: Optional[str] = None
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    price: Optional[float] = None
    certifications: Optional[List[str]] = None
    supplier_info: Optional[str] = None


class SeedResponse(SeedCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
