from fastapi import HTTPException
from app.schemas.currency_schema import ConvertRequest, ConvertResponse

class CurrencyService:
    # Bảng tỷ giá chuẩn (Lấy USD làm gốc để khớp với chuẩn Quốc tế và Frontend)
    MOCK_RATES = {
        "USD": 1.0, 
        "VND": 25450.0, 
        "THB": 36.8, 
        "SGD": 1.35, 
        "MYR": 4.75, 
        "IDR": 16100.0, 
        "PHP": 57.2, 
        "KHR": 4100.0, 
        "LAK": 21000.0,
        "EUR": 0.92,
        "JPY": 150.5
    }

    @staticmethod
    async def get_exchange_rates() -> dict:
        """API trả về toàn bộ bảng tỷ giá cho Frontend (Tránh lỗi 404)"""
        return {
            "base": "USD",
            "source": "BanknoteAI Regional Rates (Backend API)",
            "rates": CurrencyService.MOCK_RATES
        }

    @staticmethod
    async def convert_to_vnd(data: ConvertRequest) -> ConvertResponse:
        currency_code = data.from_currency.upper()
        
        if currency_code not in CurrencyService.MOCK_RATES:
            raise HTTPException(
                status_code=400, 
                detail=f"Hệ thống chưa hỗ trợ loại tiền tệ: {currency_code}"
            )
            
        # Thuật toán tính tỷ giá chéo (Từ Ngoại tệ -> USD -> VND)
        rate_to_vnd = CurrencyService.MOCK_RATES["VND"] / CurrencyService.MOCK_RATES[currency_code]
        converted_amount = data.amount * rate_to_vnd
        
        return ConvertResponse(
            from_currency=currency_code,
            to_currency="VND",
            original_amount=data.amount,
            exchange_rate=round(rate_to_vnd, 2),
            converted_amount=round(converted_amount, 2)
        )