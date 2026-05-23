from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.models.user_model import User
from app.models.feedback_model import Feedback
from app.schemas.feedback_schema import FeedbackCreate


def _feedback_to_dict(feedback: Feedback) -> Dict[str, Any]:
    return {
        "id": str(feedback.id),
        "user_id": feedback.user_id,
        "feedback_type": feedback.feedback_type,
        "message": feedback.message,
        "attached_image_url": feedback.attached_image_url,
        "related_result_id": feedback.related_result_id,
        "is_resolved": feedback.is_resolved,
        "status": getattr(feedback, "status", "pending") or "pending",
        "admin_reply": getattr(feedback, "admin_reply", None),
        "created_at": feedback.created_at,
        "updated_at": getattr(feedback, "updated_at", None),
    }


class FeedbackService:
    @staticmethod
    async def create_feedback(user: User, data: FeedbackCreate) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)

        feedback = Feedback(
            user_id=str(user.id),
            feedback_type=data.feedback_type or "suggestion",
            message=data.message,
            attached_image_url=data.attached_image_url,
            related_result_id=data.related_result_id,
            is_resolved=False,
            status="pending",
            admin_reply=None,
            created_at=now,
            updated_at=now,
        )

        await feedback.insert()
        return _feedback_to_dict(feedback)

    @staticmethod
    async def get_user_feedbacks(user: User) -> List[Dict[str, Any]]:
        # Không dùng Feedback.user_id vì project đang lỗi AttributeError: user_id.
        # Query dict an toàn hơn với Beanie/Pydantic.
        feedbacks = (
            await Feedback.find({"user_id": str(user.id)})
            .sort("-created_at")
            .to_list()
        )

        return [_feedback_to_dict(item) for item in feedbacks]

    @staticmethod
    async def get_all_feedbacks() -> List[Dict[str, Any]]:
        feedbacks = await Feedback.find_all().sort("-created_at").to_list()
        return [_feedback_to_dict(item) for item in feedbacks]

    @staticmethod
    async def mark_resolved(
        feedback_id: str,
        admin_reply: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        feedback = await Feedback.get(feedback_id)

        if not feedback:
            return None

        feedback.is_resolved = True
        feedback.status = "resolved"
        feedback.admin_reply = admin_reply
        feedback.updated_at = datetime.now(timezone.utc)

        await feedback.save()
        return _feedback_to_dict(feedback)