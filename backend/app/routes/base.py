from fastapi import APIRouter
from app.controllers import get_welcome_message, get_health_status

router = APIRouter()

router.get("/")(get_welcome_message)
router.get("/health", tags=["Health"])(get_health_status)