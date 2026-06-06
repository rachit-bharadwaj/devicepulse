from fastapi import APIRouter
from app.controllers.user import (
    get_users,
    get_user_by_id,
    create_user,
    update_user,
    delete_user,
)
from app.schemas import (
    UserListResponse,
    UserDetailResponse,
    UserDeleteResponse,
)

user_router = APIRouter(
    prefix="/user",
    tags=["User"]
)

user_router.get("/", response_model=UserListResponse)(get_users)
user_router.post("/", response_model=UserDetailResponse)(create_user)
user_router.get("/{user_id}", response_model=UserDetailResponse)(get_user_by_id)
user_router.put("/{user_id}", response_model=UserDetailResponse)(update_user)
user_router.patch("/{user_id}", response_model=UserDetailResponse)(update_user)
user_router.delete("/{user_id}", response_model=UserDeleteResponse)(delete_user)