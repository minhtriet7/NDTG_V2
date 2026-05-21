from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Banknote Recognition API"
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "banknote_system"
    
    # Security (Sử dụng SECRET_KEY này cho cả JWT và SessionMiddleware của OAuth)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    
    # Google API (LLM & Lens)
    GOOGLE_API_KEY: Optional[str] = None
    
    # Google Auth (OAuth2)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # Sepay Payment
    SEPAY_API_TOKEN: Optional[str] = None
    BANK_ACCOUNT_NUMBER: Optional[str] = None
    BANK_ID: Optional[str] = None
    ACCOUNT_NAME: Optional[str] = None
    IMGBB_API_KEY: Optional[str] = None
    SERPAPI_KEY: Optional[str] = None
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    AGENT1_YOLO_MODEL_PATH: str = "models/yolo/best.pt"
    AGENT1_RES_MODEL_PATH: str = "models/res/banknote_efficientnet_b0_best.pth"
    AGENT1_RES_CLASSES_PATH: str = "models/res/classes.txt"

    AGENT1_YOLO_CONF: float = 0.25
    AGENT1_YOLO_IMGSZ: int = 640
    AGENT1_RES_IMGSZ: int = 224
    class Config:
        env_file = ".env"
        extra = "ignore" # Bỏ qua các biến thừa trong .env nếu không khai báo ở đây

settings = Settings()