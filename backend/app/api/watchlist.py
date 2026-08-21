from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import WatchlistCoin

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
def get_watchlist(db: Session = Depends(get_db)):
    coins = db.query(WatchlistCoin).all()

    return [
        {
            "id": coin.id,
            "coin_id": coin.coin_id,
            "created_at": coin.created_at
        }
        for coin in coins
    ]