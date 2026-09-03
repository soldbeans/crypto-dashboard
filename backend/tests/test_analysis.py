from app.services.analysis import (
    calculate_rsi,
    calculate_sma,
    calculate_ema,
    calculate_macd,
    calculate_signal_score,
    interpret_signal_score,
)


def test_rsi_returns_none_with_insufficient_data():
    prices = [100, 101, 102]

    result = calculate_rsi(prices)

    assert result is None


def test_sma_returns_none_with_insufficient_data():
    prices = [100, 101, 102]

    result = calculate_sma(prices)

    assert result is None


def test_ema_returns_none_with_insufficient_data():
    prices = [100, 101, 102]

    result = calculate_ema(prices)

    assert result is None
    
    
def test_sma_calculates_correctly():
    prices = [10, 20, 30, 40, 50]

    result = calculate_sma(prices, period=5)

    assert result == 30
    
    
def test_rsi_calculates_correctly():
    prices = [
        44.34,
        44.09,
        44.15,
        43.61,
        44.33,
        44.83,
        45.10,
        45.42,
        45.84,
        46.08,
        45.89,
        46.03,
        45.61,
        46.28,
        46.28,
        46.00,
        46.03,
        46.41,
        46.22,
        45.64,
        46.21,
    ]

    result = calculate_rsi(prices, period=14)

    assert result == 62.88


def test_ema_calculates_correctly():
    prices = [10, 20, 30, 40, 50]

    result = calculate_ema(prices, period=3)

    assert result == 40
    

def test_macd_calculates_correctly():
    prices = [
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        50
    ]

    result = calculate_macd(prices)

    assert result is not None
    assert result["macd"] == 7.0
    assert result["signal"] == 7.0
    assert result["histogram"] == 0.0


def test_signal_score_calculates_bullish_score():
    macd = {
        "macd": 5.0,
        "signal": 3.0,
        "histogram": 2.0
    }

    result = calculate_signal_score(
        rsi_signal="oversold",
        sma_signal="bullish",
        ema_signal="bullish",
        macd=macd
    )

    assert result == 7


def test_signal_score_calculates_bearish_score():
    macd = {
        "macd": -5.0,
        "signal": -3.0,
        "histogram": -2.0
    }

    result = calculate_signal_score(
        rsi_signal="overbought",
        sma_signal="bearish",
        ema_signal="bearish",
        macd=macd
    )

    assert result == -7


def test_interpret_signal_score_buy():
    result = interpret_signal_score(7)

    assert result == "BUY"


def test_interpret_signal_score_hold():
    result = interpret_signal_score(0)

    assert result == "HOLD"


def test_interpret_signal_score_sell():
    result = interpret_signal_score(-7)

    assert result == "SELL"


def test_interpret_signal_score_buy_boundary():
    assert interpret_signal_score(5) == "BUY"
    assert interpret_signal_score(4) == "HOLD"


def test_interpret_signal_score_sell_boundary():
    assert interpret_signal_score(-5) == "SELL"
    assert interpret_signal_score(-4) == "HOLD"