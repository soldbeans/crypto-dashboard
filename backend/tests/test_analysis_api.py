from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_analysis_endpoint_returns_success():
    fake_history = {
        "prices": [
            {
                "timestamp": i,
                "price": float(100 + i)
            }
            for i in range(50)
        ]
    }

    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=fake_history)
    ):
        response = client.get("/coins/bitcoin/analysis")

    assert response.status_code == 200


def test_analysis_endpoint_returns_404_for_invalid_coin():
    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=None)
    ):
        response = client.get("/coins/not-a-real-coin/analysis")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "No historical data available for this coin."
    }


def test_analysis_endpoint_returns_422_for_insufficient_data():
    fake_history = {
        "prices": [
            {
                "timestamp": i,
                "price": float(100 + i)
            }
            for i in range(20)
        ]
    }

    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=fake_history)
    ):
        response = client.get("/coins/bitcoin/analysis")

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Insufficient historical data for technical analysis."
    }


def test_analysis_endpoint_returns_429_for_rate_limit():
    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(
            side_effect=RuntimeError("CoinGecko rate limit exceeded.")
        )
    ):
        response = client.get("/coins/bitcoin/analysis")

    assert response.status_code == 429
    assert response.json() == {
        "detail": "CoinGecko rate limit exceeded."
    }


def test_analysis_endpoint_returns_503_for_service_failure():
    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(
            side_effect=RuntimeError(
                "CoinGecko service is currently unavailable."
            )
        )
    ):
        response = client.get("/coins/bitcoin/analysis")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "CoinGecko service is currently unavailable."
    }


def test_analysis_endpoint_response_schema():
    fake_history = {
        "prices": [
            {
                "timestamp": i,
                "price": float(100 + i)
            }
            for i in range(50)
        ]
    }

    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=fake_history)
    ):
        response = client.get("/coins/bitcoin/analysis")

    assert response.status_code == 200

    data = response.json()

    assert data["coin"] == "bitcoin"
    assert isinstance(data["current_price"], float)

    assert "indicators" in data
    assert "rsi" in data["indicators"]
    assert "sma" in data["indicators"]
    assert "ema" in data["indicators"]
    assert "macd" in data["indicators"]

    assert "value" in data["indicators"]["rsi"]
    assert "signal" in data["indicators"]["rsi"]

    assert "value" in data["indicators"]["sma"]
    assert "signal" in data["indicators"]["sma"]

    assert "value" in data["indicators"]["ema"]
    assert "signal" in data["indicators"]["ema"]

    assert "value" in data["indicators"]["macd"]
    assert "signal_line" in data["indicators"]["macd"]
    assert "histogram" in data["indicators"]["macd"]
    assert "trend" in data["indicators"]["macd"]

    assert "overall" in data
    assert "score" in data["overall"]
    assert "recommendation" in data["overall"]
    assert "strength" in data["overall"]
    assert "reasons" in data["overall"]

    assert isinstance(data["overall"]["score"], int)
    assert isinstance(data["overall"]["recommendation"], str)
    assert isinstance(data["overall"]["strength"], str)
    assert isinstance(data["overall"]["reasons"], list)