from fastapi import APIRouter, Query

from app.models.machinery_rental import MachineryRental
from app.schemas.machinery_rental import MachineryRentalResponse

router = APIRouter(prefix="/machinery-rentals", tags=["machinery-rentals"])


def _to_response(item: MachineryRental) -> MachineryRentalResponse:
    return MachineryRentalResponse(id=str(item.id), **item.model_dump(exclude={"id"}))


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
