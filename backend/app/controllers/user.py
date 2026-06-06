from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import connect_db
from app.database.models import User
from app.schemas import UserCreate, UserUpdate
from app.utils.auth import hash_password


async def get_users(db: Session = Depends(connect_db)):
    users = db.query(User).all()
    return {
        "status": 200,
        "message": "Users fetched successfully",
        "users": users,
        "count": len(users),
    }


async def get_user_by_id(user_id: int, db: Session = Depends(connect_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return {
        "status": 200,
        "message": "User fetched successfully",
        "user": db_user,
    }


async def create_user(user_data: UserCreate, db: Session = Depends(connect_db)):
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash the password and create user
    hashed_pwd = hash_password(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_data.role,
        is_active=user_data.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {
        "status": 201,
        "message": "User created successfully",
        "user": db_user,
    }


async def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(connect_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_dict = user_data.model_dump(exclude_unset=True)

    # If email is being updated, check if it's unique
    if "email" in update_dict and update_dict["email"] != db_user.email:
        existing_email = db.query(User).filter(User.email == update_dict["email"]).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # If username is being updated, check if it's unique
    if "username" in update_dict and update_dict["username"] != db_user.username:
        existing_username = db.query(User).filter(User.username == update_dict["username"]).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )

    # If password is being updated, hash it
    if "password" in update_dict:
        db_user.hashed_password = hash_password(update_dict.pop("password"))

    # Update other fields
    for key, value in update_dict.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return {
        "status": 200,
        "message": "User updated successfully",
        "user": db_user,
    }


async def delete_user(user_id: int, db: Session = Depends(connect_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    db.delete(db_user)
    db.commit()
    return {
        "status": 204,
        "message": "User deleted successfully",
    }