from fastapi import APIRouter

from app.services.coingecko import get_trending

router = APIRouter()


@router.get("/trending")
async def trending():
    return await get_trending()