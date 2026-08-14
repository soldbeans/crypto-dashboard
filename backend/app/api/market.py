from fastapi import APIRouter

from app.services.coingecko import get_trending, get_global

router = APIRouter()


@router.get("/trending")
async def trending():
    return await get_trending()

@router.get("/global")
async def global_market():
    return await get_global()