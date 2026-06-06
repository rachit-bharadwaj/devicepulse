from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def base():
    return {
        "message": "Welcome to Device Pulse API",
        "author": "Rachit Bharadwaj",
        "github": "https://github.com/rachit-bharadwaj/devicepulse",
    }


@router.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "message": "Device Pulse API is running",
    }