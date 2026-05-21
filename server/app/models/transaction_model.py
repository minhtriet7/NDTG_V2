from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone

class Transaction(Document):
    user_id: str
    package_id: str
    amount: float
    currency: str = "VND"
    tokens_added: int
    status: str = "pending" # pending, success, failed
    payment_gateway: str = "sepay" # sepay, stripe...
    transaction_code: str # Mã giao dịch tham chiếu từ ngân hàng/Sepay
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "transactions"