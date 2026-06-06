from fastapi import APIRouter
from app.controllers.auth import register_user, login_user
from app.schemas import UserDetailResponse, TokenResponse

auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

auth_router.post("/register", response_model=UserDetailResponse)(register_user)
auth_router.post("/login", response_model=TokenResponse)(login_user)
