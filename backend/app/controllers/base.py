from app.config import settings

async def get_welcome_message():
    return {
        "message": "Welcome to Device Pulse API",
        "author": "Rachit Bharadwaj",
        "github": "https://github.com/rachit-bharadwaj/devicepulse",
        "environment": settings.ENVIRONMENT,
    }


async def get_health_status():
    return {
        "status": "ok",
        "message": "Device Pulse API is running",
    }
