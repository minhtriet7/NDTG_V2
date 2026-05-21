from app.services.admin_service import AdminService

class AdminController:
    @staticmethod
    async def get_dashboard():
        return await AdminService.get_dashboard_stats()