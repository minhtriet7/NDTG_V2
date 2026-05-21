from fastapi import HTTPException
from app.schemas.currency_schema import ConvertRequest, ConvertResponse

class CurrencyService:
    # Bảng tỷ giá giả lập (Mock data) so với VND
    MOCK_RATES = {
        "USD": 25400.0,
        "EUR": 27500.0,
        "JPY": 165.0,
        "THB": 690.0,
        "VND": 1.0
    }

    @staticmethod
    async def convert_to_vnd(data: ConvertRequest) -> ConvertResponse:
        currency_code = data.from_currency.upper()
        
        if currency_code not in CurrencyService.MOCK_RATES:
            raise HTTPException(
                status_code=400, 
                detail=f"Hệ thống chưa hỗ trợ loại tiền tệ: {currency_code}"
            )
            
        rate = CurrencyService.MOCK_RATES[currency_code]
        converted_amount = data.amount * rate
        
        # TODO: Sau này có thể lưu lịch sử đổi tiền vào DB (bảng CurrencyConversion) ở đây
        
        return ConvertResponse(
            from_currency=currency_code,
            to_currency="VND",
            original_amount=data.amount,
            exchange_rate=rate,
            converted_amount=converted_amount
        )