from datetime import datetime
from pydantic import BaseModel, Field
from app.database.models import DeviceStatus


class DeviceBase(BaseModel):
    name: str = Field(..., max_length=255, example="Core Router")
    ip_address: str = Field(..., max_length=45, example="192.168.1.1")
    type: str = Field(..., max_length=100, example="Router")
    status: DeviceStatus = DeviceStatus.DOWN
    description: str | None = Field(None, max_length=500, example="Primary edge router")


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    name: str | None = Field(None, max_length=255, example="Core Router")
    ip_address: str | None = Field(None, max_length=45, example="192.168.1.1")
    type: str | None = Field(None, max_length=100, example="Router")
    status: DeviceStatus | None = None
    description: str | None = Field(None, max_length=500, example="Primary edge router")


class DeviceResponse(DeviceBase):
    id: int
    last_checked: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeviceListResponse(BaseModel):
    status: int
    message: str
    devices: list[DeviceResponse]
    count: int


class DeviceCreateResponse(BaseModel):
    status: int
    message: str
    device: DeviceResponse


# Re-use or alias for detail/update endpoints
class DeviceDetailResponse(DeviceCreateResponse):
    pass


class DeviceDeleteResponse(BaseModel):
    status: int
    message: str
