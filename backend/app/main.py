from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, coins, market, watchlist, analysis
from app.database.database import Base, engine
from app.database import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Crypto Dashboard API",
    version="1.0.0",
    description="Backend API for tracking cryptocurrency prices."
)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)


app.include_router(health.router)
app.include_router(coins.router)
app.include_router(market.router)
app.include_router(watchlist.router)
app.include_router(analysis.router)