from fastapi import FastAPI
from app.services.coingecko import get_ping

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