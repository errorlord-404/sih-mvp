from typing import List

from bson.errors import InvalidId
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, status

from app.models.machinery_rental import MachineryRental
from app.schemas.machinery_rental import (
    MachineryRentalCreate,
    MachineryRentalResponse,
    MachineryRentalUpdate,
)

router = APIRouter(prefix="/machinery-rentals", tags=["machinery-rentals"])


def _to_response(machinery_rental: MachineryRental) -> MachineryRentalResponse:
    return MachineryRentalResponse(
        id=str(machinery_rental.id),
        name=machinery_rental.name,
        category=machinery_rental.category,
        hp=machinery_rental.hp,
        implements_included=machinery_rental.implements_included,
        hourly_rate=machinery_rental.hourly_rate,
        daily_rate=machinery_rental.daily_rate,
        owner_name=machinery_rental.owner_name,
        village=machinery_rental.village,
        phone=machinery_rental.phone,
        rating=machinery_rental.rating,
        reviews_count=machinery_rental.reviews_count,
        available_status=machinery_rental.available_status,
    )


def _to_object_id(machinery_rental_id: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(machinery_rental_id)
    except (InvalidId, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid machinery rental ID",
        )


@router.post("", response_model=MachineryRentalResponse, status_code=status.HTTP_201_CREATED)
async def create_machinery_rental(payload: MachineryRentalCreate):
    machinery_rental = MachineryRental(**payload.model_dump())
    await machinery_rental.insert()
    return _to_response(machinery_rental)


@router.get("", response_model=List[MachineryRentalResponse])
async def list_machinery_rentals():
    machinery_rentals = await MachineryRental.find_all().to_list()
    return [_to_response(machinery_rental) for machinery_rental in machinery_rentals]


@router.get("/{machinery_rental_id}", response_model=MachineryRentalResponse)
async def get_machinery_rental(machinery_rental_id: str):
    machinery_rental = await MachineryRental.get(_to_object_id(machinery_rental_id))
    if not machinery_rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machinery rental not found",
        )
    return _to_response(machinery_rental)


@router.put("/{machinery_rental_id}", response_model=MachineryRentalResponse)
async def update_machinery_rental(machinery_rental_id: str, payload: MachineryRentalUpdate):
    machinery_rental = await MachineryRental.get(_to_object_id(machinery_rental_id))
    if not machinery_rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machinery rental not found",
        )

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(machinery_rental, field_name, value)
    await machinery_rental.save()
    return _to_response(machinery_rental)


@router.delete("/{machinery_rental_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_machinery_rental(machinery_rental_id: str):
    machinery_rental = await MachineryRental.get(_to_object_id(machinery_rental_id))
    if not machinery_rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machinery rental not found",
        )
    await machinery_rental.delete()
