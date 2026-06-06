from fastapi import APIRouter
from app.controllers.user import (
    get_users,
)
from app.schemas import (
    UserListResponse,
)

user_router = APIRouter(
    prefix="/user",
    tags=["User"]
)

user_router.get("/", response_model=UserListResponse)(get_users)