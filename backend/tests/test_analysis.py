from app.services.analysis import (
    calculate_rsi,
    calculate_sma,
    calculate_ema,
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