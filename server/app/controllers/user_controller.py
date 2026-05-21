from app.models.user_model import User
from app.schemas.user_schema import UserUpdate, ChangePasswordRequest
from app.services.user_service import UserService

class UserController:
    @staticmethod
    async def get_profile(user: User):
        # Chuyển đổi object user thành dictionary
        user_dict = user.model_dump() if hasattr(user, "model_dump") else dict(user)
        
        # Kiểm tra mật khẩu (nếu không có hoặc là chuỗi rỗng thì trả về False)
        password = getattr(user, "password", "")
        user_dict["has_password"] = bool(password and password.strip() != "")
        
        return user_dict
        
    @staticmethod
    async def update_profile(user: User, data: UserUpdate):
        return await UserService.update_profile(user, data)
        
    @staticmethod
    async def change_password(user: User, data: ChangePasswordRequest):
        return await UserService.change_password(user, data)
        
    @staticmethod
    async def get_history(user: User):
        return await UserService.get_recognition_history(str(user.id))