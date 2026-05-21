from pydantic import BaseModel, EmailStr, Field
from pydantic.functional_validators import BeforeValidator
from typing import Optional, Annotated

# Khai báo kiểu dữ liệu tùy chỉnh: Tự động chuyển ObjectId thành String
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    # Sử dụng PyObjectId thay vì str mặc định
    id: PyObjectId = Field(alias="_id", default=None) 
    email: str
    full_name: str
    role: str
    token_balance: int = 0
    has_password: bool = True
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)