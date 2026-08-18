from typing import List

from bson.errors import InvalidId
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Query, status

from app.models.market_price import MarketPrice
from app.schemas.market_price import (
    CompareMandisResponse,
    MandiComparisonResponse,
    MarketPriceCreate,
    MarketPriceResponse,
    MarketPriceUpdate,
)

router = APIRouter(prefix="/market-prices", tags=["market-prices"])

TRANSPORT_WITHIN_DISTRICT = 500.0
TRANSPORT_WITHIN_STATE = 1500.0
TRANSPORT_OTHER_STATE = 3000.0
LOADING_COST = 200.0
UNLOADING_COST = 200.0
MARKET_FEE_RATE = 0.02


def _transport_cost(mandi_state: str, mandi_district: str, farmer_state: str, farmer_district: str) -> float:
    if mandi_state.strip().lower() == farmer_state.strip().lower() and mandi_district.strip().lower() == farmer_district.strip().lower():
        return TRANSPORT_WITHIN_DISTRICT
    if mandi_state.strip().lower() == farmer_state.strip().lower():
        return TRANSPORT_WITHIN_STATE
    return TRANSPORT_OTHER_STATE


def _to_response(market_price: MarketPrice) -> MarketPriceResponse:
    return MarketPriceResponse(
        id=str(market_price.id),
        crop_name=market_price.crop_name,
        mandi_name=market_price.mandi_name,
        price_per_quintal=market_price.price_per_quintal,
        min_price=market_price.min_price,
        max_price=market_price.max_price,
        arrival_today_qtl=market_price.arrival_today_qtl,
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


@router.get("/compare/{crop_name}", response_model=CompareMandisResponse)
async def compare_mandis(
    crop_name: str,
    farmer_district: str = Query(..., min_length=1),
    farmer_state: str = Query(..., min_length=1),
):
    market_prices = await MarketPrice.find(MarketPrice.crop_name == crop_name).to_list()

    results = []
    for market_price in market_prices:
        transport_cost = _transport_cost(
            market_price.state,
            market_price.district,
            farmer_state,
            farmer_district,
        )
        sale_revenue = market_price.price_per_quintal
        loading_cost = LOADING_COST
        unloading_cost = UNLOADING_COST
        market_fees = MARKET_FEE_RATE * market_price.price_per_quintal
        storage_cost = 0.0
        expected_spoilage = 0.0
        net_realisation = (
            sale_revenue
            - transport_cost
            - loading_cost
            - unloading_cost
            - market_fees
            - storage_cost
            - expected_spoilage
        )
        results.append(
            MandiComparisonResponse(
                market_price_id=str(market_price.id),
                crop_name=market_price.crop_name,
                mandi_name=market_price.mandi_name,
                state=market_price.state,
                district=market_price.district,
                price_per_quintal=market_price.price_per_quintal,
                transport_cost=transport_cost,
                loading_cost=loading_cost,
                unloading_cost=unloading_cost,
                market_fees=market_fees,
                storage_cost=storage_cost,
                expected_spoilage=expected_spoilage,
                sale_revenue=sale_revenue,
                net_realisation=net_realisation,
            )
        )

    results.sort(key=lambda item: item.net_realisation, reverse=True)
    return CompareMandisResponse(
        crop_name=crop_name,
        farmer_district=farmer_district,
        farmer_state=farmer_state,
        results=results,
    )


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
