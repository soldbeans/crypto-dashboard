from fastapi import APIRouter, HTTPException

from app.services.coingecko import (
    get_coin,
    search_coin,
    get_coin_history,
)

router = APIRouter()


@router.get("/coins/{coin_id}")
async def coin(coin_id: str):
    coin = await get_coin(coin_id)

    if coin is None:
        return {
            "error": "Coin not found"
        }

    return coin


@router.get("/coins/{coin_id}/history")
async def coin_history(coin_id: str, days: int = 30):
    if days not in (7, 30, 90):
        raise HTTPException(
            status_code=400,
            detail="days must be one of: 7, 30, 90",
        )

    data = await get_coin_history(coin_id, days)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Price history not found.",
        )

    return data


@router.get("/search")
async def search(query: str):
    return await search_coin(query)