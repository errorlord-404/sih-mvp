from beanie import PydanticObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Query, status

from app.models.machinery_rental import MachineryRental
from app.schemas.machinery_rental import (
    MachineryRentalCreate,
    MachineryRentalResponse,
    MachineryRentalUpdate,
)

router = APIRouter(prefix="/machinery-rentals", tags=["machinery-rentals"])


def _to_response(item: MachineryRental) -> MachineryRentalResponse:
    return MachineryRentalResponse(id=str(item.id), **item.model_dump(exclude={"id"}))


def _normalise_aliases(values: dict, *, fill_defaults: bool = False) -> dict:
    if "provider_name" in values or "owner_name" in values:
        provider = values.get("provider_name") or values.get("owner_name")
        values["provider_name"] = provider
        values["owner_name"] = values.get("owner_name") or provider
    if "location" in values or "village" in values:
        location = values.get("location") or values.get("village")
        values["location"] = location
        values["village"] = values.get("village") or location
    if "contact_phone" in values or "phone" in values:
        phone = values.get("contact_phone") or values.get("phone")
        values["contact_phone"] = phone
        values["phone"] = values.get("phone") or phone
    if fill_defaults or "availability_status" in values or "available_status" in values:
        availability = values.get("available_status") or values.get("availability_status") or "unknown"
        values["availability_status"] = availability
        values["available_status"] = values.get("available_status") or availability
    return values


def _to_object_id(rental_id: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(rental_id)
    except (InvalidId, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid machinery rental ID",
        ) from exc


@router.post("", response_model=MachineryRentalResponse, status_code=status.HTTP_201_CREATED)
async def create_machinery_rental(payload: MachineryRentalCreate):
    rental = MachineryRental(**_normalise_aliases(payload.model_dump(), fill_defaults=True))
    await rental.insert()
    return _to_response(rental)


@router.get("", response_model=list[MachineryRentalResponse])
async def list_machinery_rentals(
    category: str | None = Query(default=None, min_length=1),
    district: str | None = Query(default=None, min_length=1),
    state: str | None = Query(default=None, min_length=1),
):
    criteria = []
    if category:
        criteria.append(MachineryRental.category == category)
    if district:
        criteria.append(MachineryRental.district == district)
    if state:
        criteria.append(MachineryRental.state == state)
    records = await MachineryRental.find(*criteria).to_list()
    records.sort(key=lambda item: item.distance_km if item.distance_km is not None else float("inf"))
    return [_to_response(record) for record in records]


@router.get("/{rental_id}", response_model=MachineryRentalResponse)
async def get_machinery_rental(rental_id: str):
    rental = await MachineryRental.get(_to_object_id(rental_id))
    if not rental:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machinery rental not found")
    return _to_response(rental)


@router.put("/{rental_id}", response_model=MachineryRentalResponse)
async def update_machinery_rental(rental_id: str, payload: MachineryRentalUpdate):
    rental = await MachineryRental.get(_to_object_id(rental_id))
    if not rental:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machinery rental not found")
    updates = _normalise_aliases(payload.model_dump(exclude_unset=True))
    for field_name, value in updates.items():
        if value is not None:
            setattr(rental, field_name, value)
    await rental.save()
    return _to_response(rental)


@router.delete("/{rental_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_machinery_rental(rental_id: str):
    rental = await MachineryRental.get(_to_object_id(rental_id))
    if not rental:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machinery rental not found")
    await rental.delete()
