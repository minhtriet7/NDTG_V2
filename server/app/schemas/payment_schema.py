from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreateTransactionRequest(BaseModel):
    package_id: str
    gateway: Optional[str] = "sepay" # Thêm field này để nhận "mock"

class TransactionResponse(BaseModel):
    id: str
    amount: float
    tokens_added: int
    status: str
    payment_gateway: str
    transaction_code: str
    created_at: datetime
    is_mock: Optional[bool] = False # Cờ báo hiệu giả lập
    qr_url: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    account_name: Optional[str] = None

    class Config:
        from_attributes = True