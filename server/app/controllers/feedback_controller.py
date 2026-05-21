from app.models.user_model import User
from app.schemas.feedback_schema import FeedbackCreate
from app.services.feedback_service import FeedbackService

class FeedbackController:
    @staticmethod
    async def submit(user: User, data: FeedbackCreate):
        return await FeedbackService.create_feedback(user, data)
        
    @staticmethod
    async def get_all_for_user(user: User):
        return await FeedbackService.get_user_feedbacks(user)