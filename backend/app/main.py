from fastapi import FastAPI
from app.services.coingecko import get_ping, get_coin

app = FastAPI(
    title="Crypto Dashboard API",
    version="1.0.0",
    description="Backend API for tracking cryptocurrency prices."
)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Crypto Dashboard API is running!"
    }

@app.get("/ping")
async def ping():
    return await get_ping()

@app.get("/coins/{coin_id}")
async def coin(coin_id: str):
    coin = await get_coin(coin_id)

    if coin is None:
        return {
            "error": "Coin not found"
        }

    return coin