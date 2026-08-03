from fastapi import FastAPI

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