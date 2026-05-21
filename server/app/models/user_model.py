from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime, timezone

class User(Document):
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str = "user" # Có thể là 'user' hoặc 'admin'
    
    # Quản lý Token (Mặc định tặng 5 token cho user mới)
    token_balance: int = 5 
    
    is_active: bool = True
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users" # Tên Collection trong MongoDB