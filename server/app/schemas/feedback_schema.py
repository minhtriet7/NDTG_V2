from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    feedback_type: str # VD: wrong_result, system_error, suggestion
    message: str
    attached_image_url: Optional[str] = None
    related_result_id: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    feedback_type: str
    message: str
    attached_image_url: Optional[str]
    related_result_id: Optional[str]
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True