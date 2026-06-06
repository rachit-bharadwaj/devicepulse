from fastapi import APIRouter
from app.routes.base import base_router
from app.routes.device import device_router
from app.routes.user import user_router
from app.routes.auth import auth_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(base_router)
api_router.include_router(device_router)
api_router.include_router(user_router)
api_router.include_router(auth_router)

__all__ = ["api_router"]