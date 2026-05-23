from beanie import Document
from pydantic import Field
from typing import List, Optional
from datetime import datetime, timezone

class Banknote(Document):
    country: str
    denomination: str
    currency_code: str # VD: VND, USD, THB
    origin: str
    description: str
    features: List[str] = [] # Các đặc điểm nhận dạng riêng
    material: str = "Unknown"      # <--- THÊM DÒNG NÀY
    series_year: str = "Unknown"
    front_image_url: Optional[str] = None
    back_image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "banknotes"