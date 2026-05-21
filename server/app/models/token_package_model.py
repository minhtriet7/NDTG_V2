from beanie import Document
from pydantic import Field
from datetime import datetime, timezone

class TokenPackage(Document):
    name: str # VD: "Basic Pack", "Premium Pack"
    price_usd: float
    price_vnd: float
    tokens_included: int
    description: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "token_packages"