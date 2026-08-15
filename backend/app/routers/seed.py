from typing import List

from bson.errors import InvalidId
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, status

from app.models.seed import Seed
from app.schemas.seed import SeedCreate, SeedResponse, SeedUpdate

router = APIRouter(prefix="/seeds", tags=["seeds"])


def _to_response(seed: Seed) -> SeedResponse:
    return SeedResponse(
        id=str(seed.id),
        name=seed.name,
        crop_name=seed.crop_name,
        variety=seed.variety,
        price=seed.price,
        certifications=seed.certifications,
        supplier_info=seed.supplier_info,
    )


def _to_object_id(seed_id: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(seed_id)
    except (InvalidId, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid seed ID")


@router.post("", response_model=SeedResponse, status_code=status.HTTP_201_CREATED)
async def create_seed(payload: SeedCreate):
    seed = Seed(**payload.model_dump())
    await seed.insert()
    return _to_response(seed)


@router.get("", response_model=List[SeedResponse])
async def list_seeds():
    seeds = await Seed.find_all().to_list()
    return [_to_response(seed) for seed in seeds]


@router.get("/{seed_id}", response_model=SeedResponse)
async def get_seed(seed_id: str):
    seed = await Seed.get(_to_object_id(seed_id))
    if not seed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seed not found")
    return _to_response(seed)


@router.put("/{seed_id}", response_model=SeedResponse)
async def update_seed(seed_id: str, payload: SeedUpdate):
    seed = await Seed.get(_to_object_id(seed_id))
    if not seed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seed not found")

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(seed, field_name, value)
    await seed.save()
    return _to_response(seed)


@router.delete("/{seed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seed(seed_id: str):
    seed = await Seed.get(_to_object_id(seed_id))
    if not seed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seed not found")
    await seed.delete()
