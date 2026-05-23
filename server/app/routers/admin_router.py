from fastapi import APIRouter, Depends, Query
from app.models.user_model import User
from app.core.dependencies import get_current_user, require_admin
from app.controllers.admin_controller import AdminController
from app.schemas.admin_schema import (
    AgentsConfigSchema, AggregatorConfigSchema, AiModelConfigSchema, 
    GoogleLensConfigSchema, SystemSettingsSchema
)
from app.schemas.admin_schema import (
    AgentsConfigSchema,
    AggregatorConfigSchema,
    AiModelConfigSchema,
    GoogleLensConfigSchema,
    SystemSettingsSchema,
    AdminUserUpdateSchema,
    AdminUserRoleUpdateSchema,
    AdminUserStatusUpdateSchema,
)
router = APIRouter()

# Tất cả các tuyến đường đều được bảo vệ nghiêm ngặt bằng 2 lớp Dependency
@router.get("/dashboard/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin)
):
    return await AdminController.get_dashboard_summary()

@router.get("/system/health")
async def get_system_health(
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin)
):
    return await AdminController.get_system_health()

@router.get("/agents/performance")
async def get_agent_performance(
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin)
):
    return await AdminController.get_agent_performance()

@router.get("/recognition/recent")
async def get_recent_scans(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin)
):
    return await AdminController.get_recent_scans(limit)

@router.get("/feedbacks/pending")
async def get_pending_feedback(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin)
):
    return await AdminController.get_pending_feedback(limit)

@router.get("/config/agents")
async def get_agents_config(current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.get_config()

@router.put("/config/agents")
async def update_agents_config(data: AgentsConfigSchema, current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.update_config(data.model_dump(exclude_unset=True))

@router.get("/config/aggregator")
async def get_aggregator_config(current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.get_config()

@router.put("/config/aggregator")
async def update_aggregator_config(data: AggregatorConfigSchema, current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.update_config(data.model_dump(exclude_unset=True))

@router.get("/config/ai-model")
async def get_ai_model_config(current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.get_config()

@router.put("/config/ai-model")
async def update_ai_model_config(data: AiModelConfigSchema, current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.update_config(data.model_dump(exclude_unset=True))

@router.get("/config/google-lens")
async def get_google_lens_config(current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.get_config()

@router.put("/config/google-lens")
async def update_google_lens_config(data: GoogleLensConfigSchema, current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.update_config(data.model_dump(exclude_unset=True))

@router.get("/settings")
async def get_settings_config(current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.get_config()

@router.put("/settings")
async def update_settings_config(data: SystemSettingsSchema, current_user: User = Depends(get_current_user), admin_user: User = Depends(require_admin)):
    return await AdminController.update_config(data.model_dump(exclude_unset=True))

@router.get("/users")
async def get_admin_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: str = "",
    role: str = "all",
    status: str = "all",
    provider: str = "all",
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin),
):
    return await AdminController.get_users(
        page=page,
        limit=limit,
        search=search,
        role=role,
        status=status,
        provider=provider,
    )


@router.get("/users/{user_id}")
async def get_admin_user_detail(
    user_id: str,
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin),
):
    return await AdminController.get_user_detail(user_id)


@router.put("/users/{user_id}")
async def update_admin_user(
    user_id: str,
    data: AdminUserUpdateSchema,
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin),
):
    return await AdminController.update_user(
        user_id,
        data.model_dump(exclude_unset=True),
    )


@router.put("/users/{user_id}/role")
async def update_admin_user_role(
    user_id: str,
    data: AdminUserRoleUpdateSchema,
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin),
):
    return await AdminController.update_user_role(user_id, data.role)


@router.put("/users/{user_id}/status")
async def update_admin_user_status(
    user_id: str,
    data: AdminUserStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin),
):
    return await AdminController.update_user_status(
        user_id,
        data.model_dump(exclude_unset=True),
    )


@router.delete("/users/{user_id}")
async def delete_admin_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    admin_user: User = Depends(require_admin),
):
    return await AdminController.delete_user(user_id, current_user)