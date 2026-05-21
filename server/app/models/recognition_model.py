from beanie import Document
from pydantic import Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

class RecognitionRequest(Document):
    user_id: str
    uploaded_image_url: str
    status: str = "success" # success, rerun_required, uncertain
    
    # Kết quả JSON cuối cùng từ Trọng tài tổng hợp
    final_result: Optional[Dict[str, Any]] = None 
    
    # Lưu chi tiết kết quả thô của từng Agent phục vụ trang Detail
    agent_results: List[Dict[str, Any]] = [] 
    
    # Kết quả quy đổi tiền kèm theo
    conversion_result: Optional[Dict[str, Any]] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "recognition_requests"