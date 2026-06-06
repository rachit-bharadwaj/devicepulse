from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import connect_db
from app.database.models import Device
from app.schemas import DeviceCreate, DeviceUpdate


async def get_devices(db: Session = Depends(connect_db)):
    devices = db.query(Device).all()
    return {
        "status": 200,
        "message": "Devices fetched successfully",
        "devices": devices,
        "count": len(devices),
    }

async def get_device_by_id(device_id: int, db: Session = Depends(connect_db)):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        return {
            "status": 404,
            "message": "Device not found",
        }
    return {
        "status": 200,
        "message": "Device fetched successfully",
        "device": db_device,
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

async def update_device(device_id: int, device_data: DeviceUpdate, db: Session = Depends(connect_db)):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        return {
            "status": 404,
            "message": "Device not found",
        }
    db_device.name = device_data.name
    db_device.ip_address = device_data.ip_address
    db_device.type = device_data.type
    db_device.status = device_data.status
    db_device.description = device_data.description
    db.commit()
    db.refresh(db_device)
    return {
        "status": 200,
        "message": "Device updated successfully",
        "device": db_device,
    }

async def remove_device(device_id: int, db: Session = Depends(connect_db)):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        return {
            "status": 404,
            "message": "Device not found",
        }
    db.delete(db_device)
    db.commit()
    return {
        "status": 204,
        "message": "Device removed successfully",
    }
