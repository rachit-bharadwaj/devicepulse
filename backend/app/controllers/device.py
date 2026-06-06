from fastapi import Depends, HTTPException, status
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )
    # Update only the fields that were explicitly sent in the request body
    update_data = device_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_device, key, value)
        
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )
    db.delete(db_device)
    db.commit()
    return {
        "status": 204,
        "message": "Device removed successfully",
    }
