from beanie import Document


class MachineryRental(Document):
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

    class Settings:
        name = "machinery_rentals"
