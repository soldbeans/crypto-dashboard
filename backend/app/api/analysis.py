from fastapi import APIRouter

from app.services.coingecko import get_coin_history
from app.services.analysis import (
    calculate_rsi,
    interpret_rsi,
    calculate_sma,
    interpret_sma
)

router = APIRouter()


@router.get("/coins/{coin_id}/analysis")
async def analyze_coin(coin_id: str):
    history = await get_coin_history(coin_id)

    prices = [price[1] for price in history["prices"]]
    current_price = prices[-1]

    rsi = calculate_rsi(prices)
    sma = calculate_sma(prices)

    return {
        "coin": coin_id,
        "current_price": current_price,
        "rsi": rsi,
        "rsi_signal": interpret_rsi(rsi),
        "sma": sma,
        "sma_signal": interpret_sma(current_price, sma)
    }