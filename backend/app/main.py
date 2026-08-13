from fastapi import FastAPI

from app.api import health, coins, market


app = FastAPI(
    title="Crypto Dashboard API",
    version="1.0.0",
    description="Backend API for tracking cryptocurrency prices."
)


app.include_router(health.router)
app.include_router(coins.router)
app.include_router(market.router)