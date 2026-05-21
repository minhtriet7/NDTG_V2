from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.sessions import SessionMiddleware

from app.core.database import init_db
from app.core.config import settings

# Import toàn bộ Routers
from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.recognition_router import router as recognition_router
from app.routers.banknote_router import router as banknote_router
from app.routers.payment_router import router as payment_router
from app.routers.currency_router import router as currency_router
from app.routers.feedback_router import router as feedback_router
from app.routers.admin_router import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Chạy khi server start: Kết nối MongoDB
    await init_db()
    yield
    # Chạy khi server stop

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API cho hệ thống nhận diện tiền giấy Đông Nam Á",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY, max_age=3600)

# Cấu hình CORS để Client React (Tailwind v4) có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # Port mặc định của Vite/React
        "http://127.0.0.1:5173",
        "https://your-production-domain.com" # Thêm domain thật sau này
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các Router vào App (ĐÃ ĐỒNG BỘ CHUẨN)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(user_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(recognition_router, prefix="/api/v1/recognition", tags=["Recognition"])
app.include_router(banknote_router, prefix="/api/v1/banknotes", tags=["Banknotes"])
app.include_router(payment_router, prefix="/api/v1/payment", tags=["Payment"])
app.include_router(currency_router, prefix="/api/v1/currency", tags=["Currency"])
app.include_router(feedback_router, prefix="/api/v1/feedback", tags=["Feedback"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to Banknote Recognition API"}