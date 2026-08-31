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
    
async def search_coin(query: str):
    url = f"{BASE_URL}/search"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={"query": query}
        )
        response.raise_for_status()

        data = response.json()

        results = []

        for coin in data["coins"]:
            results.append({
                "id": coin["id"],
                "symbol": coin["symbol"].upper(),
                "name": coin["name"]
            })

        return results

async def get_trending():
    url = f"{BASE_URL}/search/trending"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()

        data = response.json()

        trending = []

        for item in data["coins"]:
            coin = item["item"]

            trending.append({
                "id": coin["id"],
                "name": coin["name"],
                "symbol": coin["symbol"].upper(),
                "market_cap_rank": coin["market_cap_rank"],
                "thumb": coin["thumb"]
            })

        return {
            "count": len(trending),
            "coins": trending
        }

async def get_global():
    url = f"{BASE_URL}/global"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()

        data = response.json()["data"]

        return {
            "market_cap_usd": data["total_market_cap"]["usd"],
            "volume_24h_usd": data["total_volume"]["usd"],
            "btc_dominance": data["market_cap_percentage"]["btc"],
            "eth_dominance": data["market_cap_percentage"]["eth"],
            "active_cryptocurrencies": data["active_cryptocurrencies"],
            "markets": data["markets"],
            "last_updated": data["updated_at"]
        }

async def get_markets(limit: int = 10):
    url = f"{BASE_URL}/coins/markets"

    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": limit,
        "page": 1,
        "sparkline": False
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        coins = []

        for coin in data:
            coins.append({
                "rank": coin["market_cap_rank"],
                "id": coin["id"],
                "symbol": coin["symbol"].upper(),
                "name": coin["name"],
                "price": coin["current_price"],
                "change_24h": coin["price_change_percentage_24h"]
            })

        return coins
    
async def get_coins(coin_ids: list[str]):
    url = f"{BASE_URL}/coins/markets"

    params = {
        "vs_currency": "usd",
        "ids": ",".join(coin_ids),
        "sparkline": False
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        coins = []

        for coin in data:
            coins.append({
                "id": coin["id"],
                "name": coin["name"],
                "symbol": coin["symbol"].upper(),
                "price": coin["current_price"],
                "market_cap": coin["market_cap"],
                "change_24h": coin["price_change_percentage_24h"],
                "high_24h": coin["high_24h"],
                "low_24h": coin["low_24h"]
            })

        return coins

async def get_coin_history(coin_id: str, days: int = 180):
    url = f"{BASE_URL}/coins/{coin_id}/market_chart"

    params = {
        "vs_currency": "usd",
        "days": days,
        "interval": "daily"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        
        if response.status_code == 404:
            return None
        
        if response.status_code == 429:
            raise httpx.HTTPStatusError(
                "CoinGecko API rate limit exceeded. Please try again later.",
            )
        
        if response.status_code >= 500:
            raise httpx.HTTPStatusError(
                "CoinGecko API server error. Please try again later.",
            )
        
        response.raise_for_status()
        
        data = response.json()

        if not data.get("prices"):
            return None
        
        prices = []

        for timestamp, price in data["prices"]:
            prices.append({
                "timestamp": timestamp,
                "price": price
            })

        return {
            "prices": prices
        }