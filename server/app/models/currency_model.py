from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional
class ExchangeRate(Document):
    from_currency: str # VD: USD
    to_currency: str = "VND"
    rate: float
    source: str = "External API"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "exchange_rates"

class CurrencyConversion(Document):
    user_id: Optional[str] = None # Có thể rỗng nếu khách vãng lai đổi tiền thủ công
    source_type: str # 'recognition' (đổi lúc nhận diện) hoặc 'manual' (đổi tại trang riêng)
    recognition_result_id: Optional[str] = None
    from_currency: str
    to_currency: str = "VND"
    amount: float
    exchange_rate: float
    converted_amount: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "currency_conversions"