from fastapi import FastAPI

from app.api import health, coins, market, watchlist, analysis
from app.database.database import Base, engine
from app.database import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Crypto Dashboard API",
    version="1.0.0",
    description="Backend API for tracking cryptocurrency prices."
)


app.include_router(health.router)
app.include_router(coins.router)
app.include_router(market.router)
app.include_router(watchlist.router)
app.include_router(analysis.router)