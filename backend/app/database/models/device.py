from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import String, Enum, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class DeviceStatus(str, PyEnum):
    UP = "UP"
    DOWN = "DOWN"


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)  # IPv4/IPv6 support
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., Router, Switch, Server
    status: Mapped[DeviceStatus] = mapped_column(
        Enum(DeviceStatus, name="device_status"),
        default=DeviceStatus.DOWN,
        nullable=False,
    )
    last_checked: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
