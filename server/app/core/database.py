from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

# Import các Model
from app.models.user_model import User
from app.models.banknote_model import Banknote
from app.models.currency_model import CurrencyConversion, ExchangeRate
from app.models.recognition_model import RecognitionRequest
from app.models.system_log_model import Feedback, SystemLog
from app.models.token_package_model import TokenPackage
from app.models.transaction_model import Transaction

# Khai báo biến global để lưu trữ kết nối
client = None
db = None

async def init_db():
    global client, db
    try:
        # Khởi tạo Motor Client kết nối đến MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        
        # Khởi tạo Beanie và đăng ký các Model
        await init_beanie(
            database=db,
            document_models=[
                User,
                Banknote,
                ExchangeRate,
                CurrencyConversion,
                TokenPackage,
                Transaction,
                RecognitionRequest,
                Feedback,
                SystemLog
            ]
        )
        print("✅ Đã kết nối thành công tới MongoDB!")
    except Exception as e:
        print(f"❌ Lỗi kết nối MongoDB: {e}")
        raise e

# Hàm Dependency Injection dùng cho các Router (FastAPI Depends)
async def get_db():
    if db is None:
        raise Exception("Database chưa được khởi tạo!")
    yield db