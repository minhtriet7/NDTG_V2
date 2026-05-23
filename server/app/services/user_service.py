from fastapi import HTTPException
from app.models.user_model import User
from app.models.recognition_model import RecognitionRequest
from app.schemas.user_schema import UserUpdate, ChangePasswordRequest
from app.core.security import verify_password, get_password_hash

class UserService:
    @staticmethod
    async def update_profile(user: User, data: UserUpdate) -> User:
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url
        if data.phone is not None: 
            user.phone = data.phone
        if data.country is not None: 
            user.country = data.country    
            
        await user.save()
        return user

    @staticmethod
    async def change_password(user: User, data: ChangePasswordRequest):
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
            
        user.hashed_password = get_password_hash(data.new_password)
        await user.save()
        return {"message": "Đổi mật khẩu thành công"}

    @staticmethod
    async def get_recognition_history(user_id: str):
        # Lấy lịch sử nhận diện, sắp xếp mới nhất lên đầu
        history = await RecognitionRequest.find(
            RecognitionRequest.user_id == user_id
        ).sort("-created_at").to_list()
        
        return history