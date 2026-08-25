from fastapi import APIRouter

from app.services.coingecko import get_coin_history
from app.services.analysis import calculate_rsi, interpret_rsi

router = APIRouter()


@router.get("/coins/{coin_id}/analysis")
async def analyze_coin(coin_id: str):
    history = await get_coin_history(coin_id)

    prices = [price[1] for price in history["prices"]]

    rsi = calculate_rsi(prices)

    return {
        "coin": coin_id,
        "rsi": rsi,
        "rsi_signal": interpret_rsi(rsi)
    }