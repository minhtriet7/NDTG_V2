from fastapi import APIRouter, Depends
from app.models.user_model import User
from app.core.dependencies import get_current_user
from app.schemas.user_schema import UserResponse, UserUpdate, ChangePasswordRequest
from app.controllers.user_controller import UserController

router = APIRouter()

# Tất cả API trong này đều yêu cầu user phải đăng nhập (Depends(get_current_user))
@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return await UserController.get_profile(current_user)

@router.put("/me", response_model=UserResponse)
async def update_my_profile(data: UserUpdate, current_user: User = Depends(get_current_user)):
    return await UserController.update_profile(current_user, data)

@router.put("/me/password")
async def change_password(data: ChangePasswordRequest, current_user: User = Depends(get_current_user)):
    return await UserController.change_password(current_user, data)

@router.get("/me/history")
async def get_my_recognition_history(current_user: User = Depends(get_current_user)):
    return await UserController.get_history(current_user)