from app.services.admin_service import AdminService
from app.models.user_model import User
class AdminController:
    @staticmethod
    async def get_dashboard_summary():
        kpi_data = await AdminService.get_dashboard_stats()
        payment_data = await AdminService.get_payment_overview()
        user_data = await AdminService.get_user_overview()
        banknote_data = await AdminService.get_banknote_overview()
        
        return {
            **kpi_data,
            "payments": payment_data,
            "users_breakdown": user_data,
            "banknotes_breakdown": banknote_data
        }

    @staticmethod
    async def get_system_health():
        return await AdminService.get_system_health()

    @staticmethod
    async def get_agent_performance():
        return await AdminService.get_agent_performance()

    @staticmethod
    async def get_recent_scans(limit: int):
        return await AdminService.get_recent_scans(limit)

    @staticmethod
    async def get_pending_feedback(limit: int):
        return await AdminService.get_pending_feedback(limit)
    @staticmethod
    async def get_config():
        return await AdminService.get_system_config()

    @staticmethod
    async def update_config(data: dict):
        return await AdminService.update_system_config(data)
    @staticmethod
    async def get_users(
        page: int,
        limit: int,
        search: str,
        role: str,
        status: str,
        provider: str,
    ):
        return await AdminService.get_admin_users(
            page=page,
            limit=limit,
            search=search,
            role=role,
            status=status,
            provider=provider,
        )

    @staticmethod
    async def get_user_detail(user_id: str):
        return await AdminService.get_admin_user_detail(user_id)

    @staticmethod
    async def update_user(user_id: str, data: dict):
        return await AdminService.update_admin_user(user_id, data)

    @staticmethod
    async def update_user_role(user_id: str, role: str):
        return await AdminService.update_user_role(user_id, role)

    @staticmethod
    async def update_user_status(user_id: str, data: dict):
        return await AdminService.update_user_status(user_id, data)

    @staticmethod
    async def delete_user(user_id: str, current_admin: User):
        return await AdminService.delete_admin_user(user_id, current_admin)