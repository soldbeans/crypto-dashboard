from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import WatchlistCoin
from app.services.coingecko import get_coins

import httpx
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/watchlist/{coin_id}")
def add_to_watchlist(
    coin_id: str,
    db: Session = Depends(get_db)
):
    existing_coin = (
        db.query(WatchlistCoin)
        .filter(WatchlistCoin.coin_id == coin_id)
        .first()
    )

    if existing_coin:
        return {
            "message": "Coin is already in your watchlist",
            "coin_id": coin_id
        }

    new_coin = WatchlistCoin(coin_id=coin_id)

    db.add(new_coin)
    db.commit()
    db.refresh(new_coin)

    return {
        "message": "Coin added to watchlist",
        "coin_id": new_coin.coin_id
    }

@router.get("/watchlist")
async def get_watchlist(db: Session = Depends(get_db)):
    watchlist = db.query(WatchlistCoin).all()

    if not watchlist:
        return []

    coin_ids = [coin.coin_id for coin in watchlist]

    try:
        return await get_coins(coin_ids)
    except httpx.HTTPStatusError as error:
        if error.response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="CoinGecko rate limit reached. Please try again later."
            ) from error
        
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve watchlist data."
        ) from error

@router.delete("/watchlist/{coin_id}")
def remove_from_watchlist(
    coin_id: str,
    db: Session = Depends(get_db)
):
    coin = (
        db.query(WatchlistCoin)
        .filter(WatchlistCoin.coin_id == coin_id)
        .first()
    )

    if coin is None:
        raise HTTPException(
            status_code=404,
            detail="Coin is not in your watchlist"
        )

    db.delete(coin)
    db.commit()

    return {
        "message": "Coin removed from watchlist",
        "coin_id": coin_id
    }