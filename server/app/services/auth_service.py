from fastapi import HTTPException, status
from app.models.user_model import User
from app.schemas.user_schema import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    async def register_user(data: UserRegister) -> dict:
        # Kiểm tra xem trùng email không
        existing_user = await User.find_one(User.email == data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Tạo user mới
        hashed_password = get_password_hash(data.password)
        new_user = User(
            email=data.email,
            hashed_password=hashed_password,
            full_name=data.full_name,
            role="user" 
        )
        await new_user.insert()
        
        # BÓC TÁCH & ÉP KIỂU ID THÀNH STRING (Tuyệt đối không return new_user thẳng)
        return {
            "id": str(new_user.id),
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role
        }

    @staticmethod
    async def login_user(data: UserLogin) -> dict:
        user = await User.find_one(User.email == data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="User account is locked")
            
        # Ép kiểu id thành chuỗi để tạo token
        user_id_str = str(user.id)
        access_token = create_access_token(subject=user_id_str)
        
        # BÓC TÁCH & ÉP KIỂU ID THÀNH STRING
        user_data = {
            "id": user_id_str,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }