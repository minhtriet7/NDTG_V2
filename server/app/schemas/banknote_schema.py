from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BanknoteResponse(BaseModel):
    id: str
    country: str
    denomination: str
    currency_code: str
    origin: str
    description: str
    material: str      # <--- THÊM DÒNG NÀY
    series_year: str   # <--- THÊM DÒNG NÀY
    features: List[str]
    front_image_url: Optional[str] = None
    back_image_url: Optional[str] = None

    class Config:
        from_attributes = True