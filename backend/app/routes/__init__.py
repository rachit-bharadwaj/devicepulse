from fastapi import APIRouter
from app.routes.base import router as base_router
from app.routes.device import router as device_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(base_router)
api_router.include_router(device_router)

__all__ = ["api_router"]