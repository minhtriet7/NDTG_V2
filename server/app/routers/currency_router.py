from fastapi import APIRouter
from app.schemas.currency_schema import ConvertRequest, ConvertResponse
from app.controllers.currency_controller import CurrencyController

# Khởi tạo router duy nhất
router = APIRouter(tags=["Currency"])

# 1. API Chuyển đổi tiền tệ (Giữ nguyên của bạn)
@router.post("/convert", response_model=ConvertResponse)
async def convert_currency(data: ConvertRequest):
    return await CurrencyController.convert(data)

# 2. API Lấy tỷ giá (Gộp chung thành 1 hàm duy nhất)
@router.get("/rates")
async def get_rates():
    # Trả về đầy đủ bảng tỷ giá ở đây
    return {
        "base": "USD",
        "source": "BanknoteAI Backend API",
        "rates": { 
            "USD": 1.0, 
            "VND": 25450.0, 
            "THB": 36.8, 
            "SGD": 1.35, 
            "MYR": 4.75, 
            "IDR": 16100.0,
            "PHP": 57.2, 
            "KHR": 4100.0, 
            "LAK": 21000.0
        }
    }