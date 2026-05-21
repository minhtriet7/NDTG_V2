from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone

class Feedback(Document):
    user_id: str
    feedback_type: str # wrong_result, system_error, suggestion
    message: str
    attached_image_url: Optional[str] = None
    related_result_id: Optional[str] = None
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "feedbacks"

class SystemLog(Document):
    level: str # info, warning, error
    module: str # Agent_1, Agent_3, Payment...
    message: str
    stack_trace: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "system_logs"