from app.services.analysis import (
    calculate_rsi,
    calculate_sma,
    calculate_ema,
    calculate_macd,
    calculate_signal_score,
    interpret_signal_score,
    interpret_signal_strength,
    interpret_rsi,
    interpret_sma,
    interpret_ema,
    interpret_macd,
    generate_signal_reasons,
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
    

# interpret test
def test_interpret_rsi():
    assert interpret_rsi(None) == "insufficient_data"
    assert interpret_rsi(29) == "oversold"
    assert interpret_rsi(30) == "neutral"
    assert interpret_rsi(50) == "neutral"
    assert interpret_rsi(70) == "neutral"
    assert interpret_rsi(71) == "overbought"


def test_interpret_sma():
    assert interpret_sma(110, 100) == "bullish"
    assert interpret_sma(90, 100) == "bearish"
    assert interpret_sma(100, 100) == "neutral"
    assert interpret_sma(100, None) == "insufficient_data"


def test_interpret_ema():
    assert interpret_ema(110, 100) == "bullish"
    assert interpret_ema(90, 100) == "bearish"
    assert interpret_ema(100, 100) == "neutral"
    assert interpret_ema(100, None) == "insufficient_data"


def test_interpret_macd():
    assert interpret_macd(None) == "insufficient_data"

    bullish_macd = {
        "macd": 5.0,
        "signal": 3.0,
        "histogram": 2.0
    }

    bearish_macd = {
        "macd": 2.0,
        "signal": 4.0,
        "histogram": -2.0
    }

    neutral_macd = {
        "macd": 3.0,
        "signal": 3.0,
        "histogram": 0.0
    }

    assert interpret_macd(bullish_macd) == "bullish"
    assert interpret_macd(bearish_macd) == "bearish"
    assert interpret_macd(neutral_macd) == "neutral"


def test_macd_returns_none_with_insufficient_data():
    prices = list(range(33))

    result = calculate_macd(prices)

    assert result is None


def test_signal_score_mixed_signals_returns_neutral_score():
    macd = {
        "macd": 0.0,
        "signal": 0.0,
        "histogram": 0.0
    }

    result = calculate_signal_score(
        rsi_signal="neutral",
        sma_signal="bullish",
        ema_signal="bearish",
        macd=macd
    )

    assert result == 0
    

def test_interpret_signal_strength():
    assert interpret_signal_strength(0) == "weak"
    assert interpret_signal_strength(2) == "weak"
    assert interpret_signal_strength(3) == "moderate"
    assert interpret_signal_strength(5) == "moderate"
    assert interpret_signal_strength(6) == "strong"
    assert interpret_signal_strength(7) == "strong"

    assert interpret_signal_strength(-2) == "weak"
    assert interpret_signal_strength(-3) == "moderate"
    assert interpret_signal_strength(-5) == "moderate"
    assert interpret_signal_strength(-6) == "strong"
    assert interpret_signal_strength(-7) == "strong"
    
    
def test_generate_signal_reasons_bullish_case():
    reasons = generate_signal_reasons(
        rsi_signal="oversold",
        sma_signal="bullish",
        ema_signal="bullish",
        macd_signal="bullish",
    )

    assert reasons == [
        "RSI indicates potentially oversold conditions.",
        "Price is above the SMA.",
        "Price is above the EMA.",
        "MACD indicates bullish momentum.",
    ]


def test_generate_signal_reasons_neutral_case():
    reasons = generate_signal_reasons(
        rsi_signal="neutral",
        sma_signal="neutral",
        ema_signal="neutral",
        macd_signal="neutral",
    )

    assert reasons == [
        "The indicators do not currently show a strong directional signal."
    ]