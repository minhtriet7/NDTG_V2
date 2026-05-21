from app.models.user_model import User
from app.schemas.payment_schema import CreateTransactionRequest
from app.services.payment_service import PaymentService

class PaymentController:
    @staticmethod
    async def buy_tokens(user: User, data: CreateTransactionRequest):
        return await PaymentService.create_transaction(user, data.package_id, data.gateway)
        
    @staticmethod
    async def handle_webhook(transaction_content: str):
        # Truyền theo cấu trúc dict {"content": ...} để khớp với hàm process_webhook
        return await PaymentService.process_webhook({"content": transaction_content})