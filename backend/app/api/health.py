from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root():
    return {
        "status": "online",
        "message": "Crypto Dashboard API is running!"
    }


@router.get("/ping")
async def ping():
    from app.services.coingecko import get_ping

    return await get_ping()