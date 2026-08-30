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
    interpret_macd,
    calculate_signal_score,
    interpret_signal_score
)

router = APIRouter()


@router.get("/coins/{coin_id}/analysis")
async def analyze_coin(coin_id: str):

    history = await get_coin_history(coin_id)

    prices = [price[1] for price in history["prices"]]

    current_price = prices[-1]

    # Calculate indicators
    rsi = calculate_rsi(prices)
    sma = calculate_sma(prices)
    ema = calculate_ema(prices)
    macd = calculate_macd(prices)

    # Interpret indicators
    rsi_signal = interpret_rsi(rsi)
    sma_signal = interpret_sma(current_price, sma)
    ema_signal = interpret_ema(current_price, ema)
    macd_signal = interpret_macd(macd)

    # Calculate combined signal
    signal_score = calculate_signal_score(
        rsi_signal,
        sma_signal,
        ema_signal,
        macd_signal
    )

    final_recommendation = interpret_signal_score(signal_score)

    return {
        "coin": coin_id,
        "current_price": current_price,

        "indicators": {
            "rsi": {
                "value": rsi,
                "signal": rsi_signal
            },

            "sma": {
                "value": sma,
                "signal": sma_signal
            },

            "ema": {
                "value": ema,
                "signal": ema_signal
            },

            "macd": {
                "value": macd["macd"] if macd else None,
                "signal_line": macd["signal"] if macd else None,
                "histogram": macd["histogram"] if macd else None,
                "trend": macd_signal
            }
        },

        "overall": {
            "score": signal_score,
            "recommendation": final_recommendation
        }
    }