from fastapi import APIRouter
from app.controllers.device import get_devices, add_device
from app.schemas import DeviceListResponse, DeviceCreateResponse

device_router = APIRouter(
    prefix="/device",
    tags=["Device"]
)

device_router.get("/", response_model=DeviceListResponse)(get_devices)
device_router.post("/", response_model=DeviceCreateResponse)(add_device)
