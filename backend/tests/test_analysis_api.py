from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

    
client = TestClient(app)


def test_analysis_endpoint_returns_success(valid_fake_history):
    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=valid_fake_history)
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


def test_analysis_endpoint_returns_422_for_insufficient_data(
    insufficient_fake_history
):
    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=insufficient_fake_history)
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


def test_analysis_endpoint_response_schema(valid_fake_history):
    with patch(
        "app.api.analysis.get_coin_history",
        new=AsyncMock(return_value=valid_fake_history)
    ):
        response = client.get("/coins/bitcoin/analysis")

    assert response.status_code == 200

    data = response.json()

    assert data["coin"] == "bitcoin"
    assert isinstance(data["current_price"], float)

    assert "indicators" in data
    assert "overall" in data