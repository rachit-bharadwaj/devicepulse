from fastapi import APIRouter
from app.controllers import get_welcome_message, get_health_status

base_router = APIRouter()

base_router.get("/")(get_welcome_message)
base_router.get("/health", tags=["Health"])(get_health_status)