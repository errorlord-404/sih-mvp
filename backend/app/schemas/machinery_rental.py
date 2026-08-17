from typing import Optional

from pydantic import BaseModel, ConfigDict


class MachineryRentalCreate(BaseModel):
    name: str
    category: str
    hp: str
    implements_included: str
    hourly_rate: float
    daily_rate: float
    owner_name: str
    village: str
    phone: str
    rating: float
    reviews_count: int
    available_status: str


class MachineryRentalUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    hp: Optional[str] = None
    implements_included: Optional[str] = None
    hourly_rate: Optional[float] = None
    daily_rate: Optional[float] = None
    owner_name: Optional[str] = None
    village: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    available_status: Optional[str] = None


class MachineryRentalResponse(MachineryRentalCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)
