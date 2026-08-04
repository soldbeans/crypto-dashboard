import httpx

BASE_URL = "https://api.coingecko.com/api/v3"


async def get_ping():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/ping")
        response.raise_for_status()

        return response.json()