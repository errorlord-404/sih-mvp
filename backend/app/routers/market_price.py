from typing import List

from bson.errors import InvalidId
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, status

from app.models.market_price import MarketPrice
from app.schemas.market_price import MarketPriceCreate, MarketPriceResponse, MarketPriceUpdate

router = APIRouter(prefix="/market-prices", tags=["market-prices"])


def _to_response(market_price: MarketPrice) -> MarketPriceResponse:
    return MarketPriceResponse(
        id=str(market_price.id),
        crop_name=market_price.crop_name,
        mandi_name=market_price.mandi_name,
        price_per_quintal=market_price.price_per_quintal,
        date=market_price.date,
        state=market_price.state,
        district=market_price.district,
    )


def _to_object_id(market_price_id: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(market_price_id)
    except (InvalidId, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid market price ID")


@router.post("", response_model=MarketPriceResponse, status_code=status.HTTP_201_CREATED)
async def create_market_price(payload: MarketPriceCreate):
    market_price = MarketPrice(**payload.model_dump())
    await market_price.insert()
    return _to_response(market_price)


@router.get("", response_model=List[MarketPriceResponse])
async def list_market_prices():
    market_prices = await MarketPrice.find_all().to_list()
    return [_to_response(market_price) for market_price in market_prices]


@router.get("/by-crop/{crop_name}", response_model=List[MarketPriceResponse])
async def list_market_prices_by_crop(crop_name: str):
    market_prices = await MarketPrice.find(MarketPrice.crop_name == crop_name).to_list()
    return [_to_response(market_price) for market_price in market_prices]


@router.get("/{market_price_id}", response_model=MarketPriceResponse)
async def get_market_price(market_price_id: str):
    market_price = await MarketPrice.get(_to_object_id(market_price_id))
    if not market_price:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market price not found")
    return _to_response(market_price)


@router.put("/{market_price_id}", response_model=MarketPriceResponse)
async def update_market_price(market_price_id: str, payload: MarketPriceUpdate):
    market_price = await MarketPrice.get(_to_object_id(market_price_id))
    if not market_price:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market price not found")

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(market_price, field_name, value)
    await market_price.save()
    return _to_response(market_price)


@router.delete("/{market_price_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_market_price(market_price_id: str):
    market_price = await MarketPrice.get(_to_object_id(market_price_id))
    if not market_price:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market price not found")
    await market_price.delete()
