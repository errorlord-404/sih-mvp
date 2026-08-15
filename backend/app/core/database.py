from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.farmer import Farmer
from app.models.crop import Crop
from app.models.gov_scheme import GovScheme
from app.models.market_price import MarketPrice
from app.models.msp import MSP


async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[Farmer, Crop, MarketPrice, GovScheme, MSP],
    )
    return client
