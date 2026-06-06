from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import connect_db
from app.database.models import Device
from app.schemas import DeviceCreate


async def get_devices(db: Session = Depends(connect_db)):
    devices = db.query(Device).all()
    return {
        "status": 200,
        "message": "Devices fetched successfully",
        "devices": devices,
        "count": len(devices),
    }


async def add_device(device_data: DeviceCreate, db: Session = Depends(connect_db)):
    # Instantiate the SQLAlchemy model using data from the Pydantic schema
    db_device = Device(
        name=device_data.name,
        ip_address=device_data.ip_address,
        type=device_data.type,
        status=device_data.status,
        description=device_data.description,
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return {
        "status": 201,
        "message": "Device added successfully",
        "device": db_device,
    }
