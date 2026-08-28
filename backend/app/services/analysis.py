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

# Helper function to calculate EMA series for MACD calculation #

def calculate_ema_series(
    prices: list[float],
    period: int
) -> list[float]:
    if len(prices) < period:
        return []

    multiplier = 2 / (period + 1)

    initial_ema = sum(prices[:period]) / period

    ema_values = [initial_ema]

    ema = initial_ema

    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema
        ema_values.append(ema)

    return ema_values

# Function to calculate MACD, Signal Line, and Histogram #

def calculate_macd(
    prices: list[float],
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9
) -> dict | None:

    if len(prices) < slow_period:
        return None

    fast_ema = calculate_ema_series(prices, fast_period)
    slow_ema = calculate_ema_series(prices, slow_period)

    offset = slow_period - fast_period

    macd_line = [
        fast_ema[i + offset] - slow_ema[i]
        for i in range(len(slow_ema))
    ]

    if len(macd_line) < signal_period:
        return None

    signal_line = calculate_ema_series(
        macd_line,
        signal_period
    )

    macd_current = macd_line[-1]
    signal_current = signal_line[-1]

    histogram = macd_current - signal_current

    return {
        "macd": round(macd_current, 4),
        "signal": round(signal_current, 4),
        "histogram": round(histogram, 4)
    }

# Function to interpret MACD values and provide a simple signal #

def interpret_macd(macd: dict | None) -> str:
    if macd is None:
        return "insufficient_data"

    if macd["macd"] > macd["signal"]:
        return "bullish"

    if macd["macd"] < macd["signal"]:
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