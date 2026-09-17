from fastapi import APIRouter

from app.services.coingecko import get_trending, get_global

import httpx
from fastapi import HTTPException

router = APIRouter()


@router.get("/trending")
async def trending():
    return await get_trending()

@router.get("/global")
async def global_market():
    try:
        return await get_global()
    except httpx.HTTPStatusError as error:
        if error.response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="CoinGecko rate limit reached. Please try again later."
            ) from error

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve global market data."
        ) from error