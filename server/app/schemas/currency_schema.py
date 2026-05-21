from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConvertRequest(BaseModel):
    from_currency: str
    amount: float

class ConvertResponse(BaseModel):
    from_currency: str
    to_currency: str = "VND"
    original_amount: float
    exchange_rate: float
    converted_amount: float
    message: str = "Success"