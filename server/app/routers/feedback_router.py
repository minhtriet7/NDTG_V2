from fastapi import APIRouter, Depends
from typing import List

from app.models.user_model import User
from app.core.dependencies import get_current_user
from app.schemas.feedback_schema import FeedbackCreate, FeedbackResponse
from app.controllers.feedback_controller import FeedbackController

router = APIRouter()


@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
):
    return await FeedbackController.submit(current_user, data)


@router.get("/", response_model=List[FeedbackResponse])
async def get_my_feedbacks(
    current_user: User = Depends(get_current_user),
):
    return await FeedbackController.get_all_for_user(current_user)