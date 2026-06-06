from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import connect_db
from app.database.models import Device

async def get_devices(db: Session = Depends(connect_db)):
    devices = db.query(Device).all()
    return {
        "status": 200,
        "message": "Devices fetched successfully",
        "devices": devices,
        "count": len(devices),
    }