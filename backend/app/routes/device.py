from app.controllers.device import get_devices
from fastapi import APIRouter

router = APIRouter()

router.get("/device", tags=["Device"])(get_devices)