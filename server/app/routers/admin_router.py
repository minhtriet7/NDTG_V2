from fastapi import APIRouter, Depends
from app.models.user_model import User
from app.core.dependencies import get_current_user, require_admin
from app.controllers.admin_controller import AdminController

router = APIRouter()

# Chặn 2 lớp: Phải đăng nhập (get_current_user) VÀ Phải là Admin (require_admin)
@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin) 
):
    return await AdminController.get_dashboard()