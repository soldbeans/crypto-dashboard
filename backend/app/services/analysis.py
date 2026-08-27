def calculate_rsi(prices: list[float], period: int = 14) -> float | None:
    if len(prices) < period + 1:
        return None

    gains = []
    losses = []

    for i in range(1, len(prices)):
        change = prices[i] - prices[i - 1]

        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))

    average_gain = sum(gains[:period]) / period
    average_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        average_gain = (
            (average_gain * (period - 1)) + gains[i]
        ) / period

        average_loss = (
            (average_loss * (period - 1)) + losses[i]
        ) / period

    if average_loss == 0:
        return 100.0

    relative_strength = average_gain / average_loss

    rsi = 100 - (100 / (1 + relative_strength))

    return round(rsi, 2)

def interpret_rsi(rsi: float | None) -> str:
    if rsi is None:
        return "insufficient_data"

    if rsi < 30:
        return "oversold"

    if rsi > 70:
        return "overbought"

    return "neutral"

def calculate_sma(prices: list[float], period: int = 14) -> float | None:
    if len(prices) < period:
        return None

    recent_prices = prices[-period:]

    sma = sum(recent_prices) / period

    return round(sma, 2)

def interpret_sma(current_price: float, sma: float | None) -> str:
    if sma is None:
        return "insufficient_data"

    if current_price > sma:
        return "bullish"

    if current_price < sma:
        return "bearish"

    return "neutral"

def calculate_ema(prices: list[float], period: int = 14) -> float | None:
    if len(prices) < period:
        return None

    sma = sum(prices[:period]) / period

    multiplier = 2 / (period + 1)

    ema = sma

    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema

    return round(ema, 2)

def interpret_ema(current_price: float, ema: float | None) -> str:
    if ema is None:
        return "insufficient_data"

    if current_price > ema:
        return "bullish"

    if current_price < ema:
        return "bearish"

    return "neutral"