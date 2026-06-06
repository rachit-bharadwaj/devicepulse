from fastapi import APIRouter
from app.controllers.device import (
    get_devices,
    get_device_by_id,
    add_device,
    update_device,
    remove_device,
)
from app.schemas import (
    DeviceListResponse,
    DeviceCreateResponse,
    DeviceDetailResponse,
    DeviceDeleteResponse,
)

device_router = APIRouter(
    prefix="/device",
    tags=["Device"]
)

device_router.get("/", response_model=DeviceListResponse)(get_devices)
device_router.post("/", response_model=DeviceCreateResponse)(add_device)
device_router.get("/{device_id}", response_model=DeviceDetailResponse)(get_device_by_id)
device_router.put("/{device_id}", response_model=DeviceDetailResponse)(update_device)
device_router.patch("/{device_id}", response_model=DeviceDetailResponse)(update_device)
device_router.delete("/{device_id}", response_model=DeviceDeleteResponse)(remove_device)
