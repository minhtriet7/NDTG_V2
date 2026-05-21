from app.models.user_model import User
from app.models.feedback_model import Feedback
from app.schemas.feedback_schema import FeedbackCreate

class FeedbackService:
    @staticmethod
    async def create_feedback(user: User, data: FeedbackCreate) -> Feedback:
        feedback = Feedback(
            user_id=str(user.id),
            feedback_type=data.feedback_type,
            message=data.message,
            attached_image_url=data.attached_image_url,
            related_result_id=data.related_result_id,
            is_resolved=False
        )
        await feedback.insert()
        return feedback
    
    @staticmethod
    async def get_user_feedbacks(user: User):
        # Lấy danh sách phản hồi của user, xếp mới nhất lên đầu
        feedbacks = await Feedback.find(Feedback.user_id == str(user.id)).sort("-created_at").to_list()
        return feedbacks