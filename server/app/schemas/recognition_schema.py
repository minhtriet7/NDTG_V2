from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class RecognitionResponse(BaseModel):
    id: str
    status: str
    message: str
    final_result: Optional[Dict[str, Any]] = None
    agent_results: List[Dict[str, Any]] = []
    created_at: datetime