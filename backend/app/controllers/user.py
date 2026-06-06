from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import connect_db
from app.database.models import User

async def get_users(db: Session = Depends(connect_db)):
    users = db.query(User).all()
    return {
        "status": 200,
        "message": "Users fetched successfully",
        "users": users,
        "count": len(users),
    }