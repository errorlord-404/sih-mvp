from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import init_db
from app.routers.crop import router as crop_router
from app.routers.farmer import router as farmer_router
from app.routers.gov_scheme import router as gov_scheme_router
from app.routers.market_price import router as market_price_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = await init_db()
    try:
        yield
    finally:
        client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(farmer_router)
app.include_router(crop_router)
app.include_router(market_price_router)
app.include_router(gov_scheme_router)
