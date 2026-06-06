from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import connect_db
from app.database.models import User
from app.schemas import LoginRequest, UserCreate, UserResponse
from app.utils.auth import verify_password, hash_password, create_access_token


async def register_user(user_data: UserCreate, db: Session = Depends(connect_db)):
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

    # Hash password and save user
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
        "message": "User registered successfully",
        "user": db_user,
    }


async def login_user(login_data: LoginRequest, db: Session = Depends(connect_db)):
    # Find user by username
    db_user = db.query(User).filter(User.username == login_data.username).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Verify password
    if not verify_password(login_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Check active status
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    # Generate JWT access token
    token_data = {
        "sub": db_user.username,
        "id": db_user.id,
        "role": db_user.role,
    }
    access_token = create_access_token(data=token_data)

    return {
        "status": 200,
        "message": "User logged in successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }
