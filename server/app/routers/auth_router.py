from fastapi import APIRouter, status, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from datetime import datetime, timedelta
from jose import jwt

from app.schemas.user_schema import UserRegister, UserLogin, TokenSchema, UserResponse
from app.controllers.auth_controller import AuthController
from app.core.config import settings

# Hàm tự động lấy database từ motor client (tránh lỗi import db bị None)
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# -------------------------------------------------------------------
# HÀM TẠO JWT TOKEN
# -------------------------------------------------------------------
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60 * 24) # Token có hạn 1 ngày
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# -------------------------------------------------------------------
# CẤU HÌNH OAUTH GOOGLE
# -------------------------------------------------------------------
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    return await AuthController.register(data)

@router.post("/login", response_model=TokenSchema)
async def login(data: UserLogin):
    return await AuthController.login(data)

# -------------------------------------------------------------------
# ĐƯỜNG DẪN BẮT ĐẦU ĐĂNG NHẬP GOOGLE
# -------------------------------------------------------------------
@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/api/v1/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

# -------------------------------------------------------------------
# XỬ LÝ CALLBACK TỪ GOOGLE
# -------------------------------------------------------------------
@router.get("/google/callback")
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            return RedirectResponse(url="http://localhost:5173/auth/login?error=GoogleAuthFailed")

        email = user_info.get("email")
        full_name = user_info.get("name")
        
        # Kết nối trực tiếp DB để tránh vòng lặp import
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        user_collection = db["users"]
        
        existing_user = await user_collection.find_one({"email": email})
        
        if existing_user:
            user_id = str(existing_user["_id"])
            role = existing_user.get("role", "user")
        else:
            # Tạo mới user, mật khẩu để trống ""
            new_user = {
                "email": email,
                "full_name": full_name,
                "password": "", 
                "role": "user",
                "token_balance": 10,
                "created_at": datetime.utcnow()
            }
            result = await user_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
            role = "user"

        # Đóng client sau khi xử lý xong
        client.close()

        # Tạo JWT Token
        access_token = create_access_token(data={"sub": str(user_id), "email": email, "role": role})
        # Trả về Frontend kèm token trên URL
        return RedirectResponse(url=f"http://localhost:5173/auth/google/success?token={access_token}")

    except Exception as e:
        print(f"Lỗi OAuth: {e}")
        return RedirectResponse(url="http://localhost:5173/auth/login?error=ServerError")