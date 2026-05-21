from fastapi import HTTPException
from app.schemas.user_schema import UserRegister, UserLogin, TokenSchema, UserResponse
from app.services.auth_service import AuthService

class AuthController:
    @staticmethod
    async def register(data: UserRegister) -> UserResponse:
        user = await AuthService.register_user(data)
        return user

    @staticmethod
    async def login(data: UserLogin) -> TokenSchema:
        result = await AuthService.login_user(data)
        return result