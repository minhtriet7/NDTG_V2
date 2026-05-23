from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# 1. Cấu hình Agent
class AgentsConfigSchema(BaseModel):
    timeout_seconds: int = Field(default=30, ge=1)
    max_retries: int = Field(default=3, ge=0)
    concurrent_limit: int = Field(default=5, ge=1)
    fallback_enabled: bool = Field(default=True)


# 2. Cấu hình Aggregator
class AggregatorConfigSchema(BaseModel):
    strategy: str = Field(default="majority_vote")
    min_consensus_ratio: float = Field(default=0.66, ge=0.0, le=1.0)
    ml_weight: float = Field(default=1.0, ge=0.0)
    llm_weight: float = Field(default=1.0, ge=0.0)
    lens_weight: float = Field(default=1.0, ge=0.0)


# 3. Cấu hình AI Model
class AiModelConfigSchema(BaseModel):
    model_version: str = Field(default="yolov8m")
    confidence_threshold: float = Field(default=0.75, ge=0.0, le=1.0)
    endpoint_url: str = Field(default="http://localhost:8001/predict")
    use_gpu: bool = Field(default=True)


# 4. Cấu hình Google Lens
class GoogleLensConfigSchema(BaseModel):
    api_key: Optional[str] = None
    proxy_url: Optional[str] = None
    language_code: str = Field(default="vi")
    max_results: int = Field(default=5, ge=1, le=20)


# 5. Cài đặt hệ thống chung
class SystemSettingsSchema(BaseModel):
    app_name: str = Field(default="BanknoteAI")
    support_email: EmailStr = Field(default="support@banknoteai.com")
    max_upload_size_mb: int = Field(default=5, ge=1, le=50)
    maintenance_mode: bool = Field(default=False)


# 6. Admin Users
class AdminUserUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    token_balance: Optional[int] = Field(default=None, ge=0)


class AdminUserRoleUpdateSchema(BaseModel):
    role: str = Field(pattern="^(user|admin)$")


class AdminUserStatusUpdateSchema(BaseModel):
    is_active: Optional[bool] = None
    status: Optional[str] = None