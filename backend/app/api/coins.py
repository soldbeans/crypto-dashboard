from fastapi import APIRouter

from app.services.coingecko import get_coin, search_coin

router = APIRouter()


@router.get("/coins/{coin_id}")
async def coin(coin_id: str):
    coin = await get_coin(coin_id)

    if coin is None:
        return {
            "error": "Coin not found"
        }

    return coin


@router.get("/search")
async def search(query: str):
    return await search_coin(query)