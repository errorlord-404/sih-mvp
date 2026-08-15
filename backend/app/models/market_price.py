from datetime import datetime

from beanie import Document


class MarketPrice(Document):
    crop_name: str
    mandi_name: str
    price_per_quintal: float
    date: datetime
    state: str
    district: str

    class Settings:
        name = "market_prices"
