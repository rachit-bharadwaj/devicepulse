from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from app.database.models.user import UserRole


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="john_doe")
    email: EmailStr = Field(..., max_length=255, example="john@example.com")
    role: UserRole = Field(default=UserRole.USER, example="USER")
    is_active: bool = Field(default=True, example=True)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, example="securepassword")


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=100)
    email: EmailStr | None = Field(None, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(None, min_length=6, max_length=100)


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    status: int
    message: str
    users: list[UserResponse]
    count: int


class UserDetailResponse(BaseModel):
    status: int
    message: str
    user: UserResponse
