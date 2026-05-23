from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    feedback_type: str = Field(default="suggestion")
    message: str = Field(min_length=1)
    attached_image_url: Optional[str] = None
    related_result_id: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    user_id: str

    feedback_type: str
    message: str

    attached_image_url: Optional[str] = None
    related_result_id: Optional[str] = None

    is_resolved: bool = False
    status: str = "pending"
    admin_reply: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True