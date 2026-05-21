from app.models.user_model import User
from app.models.recognition_model import RecognitionRequest
from app.models.transaction_model import Transaction

class AdminService:
    @staticmethod
    async def get_dashboard_stats() -> dict:
        total_users = await User.count()
        total_recognitions = await RecognitionRequest.count()
        
        # Tính tổng doanh thu từ các giao dịch thành công
        success_txs = await Transaction.find(Transaction.status == "success").to_list()
        total_revenue = sum(tx.amount for tx in success_txs)
        
        return {
            "total_users": total_users,
            "total_recognitions": total_recognitions,
            "total_revenue_vnd": total_revenue
        }