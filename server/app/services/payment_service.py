import uuid
from fastapi import HTTPException
from app.models.user_model import User
from app.models.token_package_model import TokenPackage
from app.models.transaction_model import Transaction
from app.utils.payment_gateway import SepayGateway
from app.core.config import settings
from beanie import PydanticObjectId

class PaymentService:
    @staticmethod
    async def create_transaction(user: User, package_id: str, gateway: str = "sepay") -> dict:
        # 1. Ép kiểu String ID sang ObjectId của MongoDB an toàn
        try:
            pkg_oid = PydanticObjectId(package_id)
        except:
            raise HTTPException(status_code=400, detail="Mã gói Token không hợp lệ.")
            
        package = await TokenPackage.get(pkg_oid)
        if not package or not package.is_active:
            raise HTTPException(status_code=404, detail="Gói Token không tồn tại trên hệ thống.")
        
        # 2. Tạo mã giao dịch ngắn gọn
        unique_suffix = uuid.uuid4().hex[:4].upper()
        tx_code = f"NAP{str(user.id)[-4:].upper()}{unique_suffix}"
        
        # 🌟 XỬ LÝ LỖI GATEWAY BANK TRANSFER TỪ FRONTEND
        if gateway == "bank_transfer":
            gateway = "sepay"
            
        # ==========================================
        # XỬ LÝ: CHẾ ĐỘ GIẢ LẬP (MOCK)
        # ==========================================
        if gateway == "mock":
            user.token_balance += package.tokens_included
            await user.save()
            
            transaction = Transaction(
                user_id=str(user.id),
                package_id=str(package.id),
                amount=package.price_vnd,
                tokens_added=package.tokens_included,
                status="success",
                transaction_code=tx_code + "_MOCK",
                payment_gateway="mock"
            )
            await transaction.insert()
            
            return {
                "id": str(transaction.id),
                "amount": transaction.amount,
                "tokens_added": transaction.tokens_added,
                "status": transaction.status,
                "payment_gateway": transaction.payment_gateway,
                "transaction_code": transaction.transaction_code,
                "created_at": transaction.created_at,
                "is_mock": True
            }

        # ==========================================
        # XỬ LÝ: THANH TOÁN THẬT (SEPAY / VIETQR)
        # ==========================================
        elif gateway == "sepay":
            qr_data = await SepayGateway.create_payment_qr(
                user_id=str(user.id),
                package_name=package.name,
                amount=int(package.price_vnd),
                tx_code=tx_code
            )
            
            transaction = Transaction(
                user_id=str(user.id),
                package_id=str(package.id),
                amount=package.price_vnd,
                tokens_added=package.tokens_included,
                status="pending",
                transaction_code=tx_code,
                payment_gateway=gateway
            )
            await transaction.insert()
            
            return {
                "id": str(transaction.id),
                "amount": transaction.amount,
                "tokens_added": transaction.tokens_added,
                "status": transaction.status,
                "payment_gateway": transaction.payment_gateway,
                "transaction_code": transaction.transaction_code,
                "created_at": transaction.created_at,
                "qr_url": qr_data.get("qr_url"),
                "bank_account": qr_data.get("bank_account"),
                "bank_name": qr_data.get("bank_name"),
                "account_name": getattr(settings, 'ACCOUNT_NAME', 'Hệ Thống BanknoteAI'),
                "is_mock": False
            }
        else:
            raise HTTPException(status_code=400, detail="Cổng thanh toán không được hỗ trợ.")
    
    @staticmethod
    async def process_webhook(webhook_data: dict) -> dict:
        transfer_content = str(webhook_data.get("content", "")).strip().upper()
        if not transfer_content:
            raise HTTPException(status_code=400, detail="Nội dung chuyển khoản trống.")
            
        pending_transactions = await Transaction.find(Transaction.status == "pending").to_list()
        
        target_transaction = None
        for tx in pending_transactions:
            if tx.transaction_code.upper() in transfer_content:
                target_transaction = tx
                break
                
        if not target_transaction:
            return {"status": "ignored", "message": "Không tìm thấy mã hóa đơn khớp."}
        
        if target_transaction.status == "success":
            return {"status": "ignored", "message": "Hóa đơn này đã được xử lý từ trước."}
            
        target_transaction.status = "success"
        await target_transaction.save()
        
        user = await User.get(target_transaction.user_id)
        if user:
            user.token_balance += target_transaction.tokens_added
            await user.save()
            
        return {"status": "success", "message": f"Thanh toán thành công. Đã cộng {target_transaction.tokens_added} Token."}