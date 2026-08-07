from fastapi import FastAPI
from app.services.coingecko import (
    get_ping,
    get_coin,
    search_coin,
    get_trending,
    get_global,
    get_markets
)

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

@app.get("/search")
async def search(query: str):
    results = await search_coin(query)
    return {"results": results}

@app.get("/search")
async def search(query: str):
    return await search_coin(query)

@app.get("/trending")
async def trending():
    return await get_trending()

@app.get("/global")
async def global_market():
    return await get_global()

@app.get("/markets")
async def markets(limit: int = 10):
    return await get_markets(limit)