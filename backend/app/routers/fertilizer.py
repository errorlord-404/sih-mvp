from typing import List

from bson.errors import InvalidId
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, status

from app.models.fertilizer import Fertilizer
from app.schemas.fertilizer import (
    FertilizerCreate,
    FertilizerResponse,
    FertilizerUpdate,
)

router = APIRouter(prefix="/fertilizer", tags=["fertilizer"])


def _to_response(fertilizer: Fertilizer) -> FertilizerResponse:
    return FertilizerResponse(
        id=str(fertilizer.id),
        name=fertilizer.name,
        type=fertilizer.type,
        crop_compatibility=fertilizer.crop_compatibility,
        recommended_dosage=fertilizer.recommended_dosage,
        price_range=fertilizer.price_range,
    )


def _to_object_id(fertilizer_id: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(fertilizer_id)
    except (InvalidId, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid fertilizer ID"
        )


@router.post("", response_model=FertilizerResponse, status_code=status.HTTP_201_CREATED)
async def create_fertilizer(payload: FertilizerCreate):
    fertilizer = Fertilizer(**payload.model_dump())
    await fertilizer.insert()
    return _to_response(fertilizer)


@router.get("", response_model=List[FertilizerResponse])
async def list_fertilizers():
    fertilizers = await Fertilizer.find_all().to_list()
    return [_to_response(fertilizer) for fertilizer in fertilizers]


@router.get("/{fertilizer_id}", response_model=FertilizerResponse)
async def get_fertilizer(fertilizer_id: str):
    fertilizer = await Fertilizer.get(_to_object_id(fertilizer_id))
    if not fertilizer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fertilizer not found"
        )
    return _to_response(fertilizer)


@router.put("/{fertilizer_id}", response_model=FertilizerResponse)
async def update_fertilizer(fertilizer_id: str, payload: FertilizerUpdate):
    fertilizer = await Fertilizer.get(_to_object_id(fertilizer_id))
    if not fertilizer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fertilizer not found"
        )

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(fertilizer, field_name, value)
    await fertilizer.save()
    return _to_response(fertilizer)


@router.delete("/{fertilizer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fertilizer(fertilizer_id: str):
    fertilizer = await Fertilizer.get(_to_object_id(fertilizer_id))
    if not fertilizer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fertilizer not found"
        )
    await fertilizer.delete()
