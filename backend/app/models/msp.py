from beanie import Document


class MSP(Document):
    crop_name: str
    msp_price_per_quintal: float
    season: str
    marketing_year: str
    procurement_centres: list[str]

    class Settings:
        name = "msps"
