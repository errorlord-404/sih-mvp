from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import init_db
from app.routers.crop import router as crop_router
from app.routers.fertilizer import router as fertilizer_router
from app.routers.farmer import router as farmer_router
from app.routers.gov_scheme import router as gov_scheme_router
from app.routers.market_price import router as market_price_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers.msp import router as msp_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = await init_db()
    try:
        yield
    finally:
        client.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for now so frontend can connect
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
app.include_router(farmer_router)
app.include_router(crop_router)
app.include_router(fertilizer_router)
app.include_router(market_price_router)
app.include_router(gov_scheme_router)
app.include_router(msp_router)
