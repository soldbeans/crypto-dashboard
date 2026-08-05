import httpx

BASE_URL = "https://api.coingecko.com/api/v3"


async def get_ping():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/ping")
        response.raise_for_status()

        return response.json()

async def get_coin(coin_id: str):
    url = f"{BASE_URL}/coins/markets"

    params = {
        "vs_currency": "usd",
        "ids": coin_id
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        if not data:
            return None

        coin = data[0]
        
        return {
            "id": coin["id"],
            "name": coin["name"],
            "symbol": coin["symbol"],
            "price": coin["current_price"],
            "market_cap": coin["market_cap"],
            "volume_24h": coin["total_volume"],
            "change_24h": coin["price_change_percentage_24h"],
            "high_24h": coin["high_24h"],
            "low_24h": coin["low_24h"],
            "last_updated": coin["last_updated"],
        }