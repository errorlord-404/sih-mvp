from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.farmer import Farmer
from app.models.crop import Crop
from app.models.disease import Disease
from app.models.fertilizer import Fertilizer
from app.models.gov_scheme import GovScheme
from app.models.machinery_rental import MachineryRental
from app.models.market_price import MarketPrice
from app.models.msp import MSP
from app.models.seed import Seed


async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            Farmer,
            Crop,
            Disease,
            Fertilizer,
            MachineryRental,
            MarketPrice,
            GovScheme,
            MSP,
            Seed,
        ],
    )
    return client
