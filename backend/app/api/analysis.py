from fastapi import APIRouter

from app.services.coingecko import get_coin_history
from app.services.analysis import (
    calculate_rsi,
    interpret_rsi,
    calculate_sma,
    interpret_sma,
    calculate_ema,
    interpret_ema,
    calculate_macd,
    interpret_macd
)

router = APIRouter()


@router.get("/coins/{coin_id}/analysis")
async def analyze_coin(coin_id: str):

    history = await get_coin_history(coin_id)

    prices = [price[1] for price in history["prices"]]

    current_price = prices[-1]

    rsi = calculate_rsi(prices)
    sma = calculate_sma(prices)
    ema = calculate_ema(prices)
    macd = calculate_macd(prices)

    return {
        "coin": coin_id,
        "current_price": current_price,
        "indicators": {
            "rsi": {
                "value": rsi,
                "signal": interpret_rsi(rsi)
            },
            "sma": {
                "value": sma,
                "signal": interpret_sma(current_price, sma)
            },
            "ema": {
                "value": ema,
                "signal": interpret_ema(current_price, ema)
            },
            "macd": {
                "value": macd["macd"] if macd else None,
                "signal_line": macd["signal"] if macd else None,
                "histogram": macd["histogram"] if macd else None,
                "trend": interpret_macd(macd)
            }
        }
    }