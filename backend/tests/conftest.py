import pytest


@pytest.fixture
def valid_fake_history():
    return {
        "prices": [
            {
                "timestamp": i,
                "price": float(100 + i)
            }
            for i in range(50)
        ]
    }


@pytest.fixture
def insufficient_fake_history():
    return {
        "prices": [
            {
                "timestamp": i,
                "price": float(100 + i)
            }
            for i in range(20)
        ]
    }