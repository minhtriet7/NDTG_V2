import httpx
from app.core.config import settings

class SepayGateway:
    """
    Service quản lý giao tiếp với cổng thanh toán Sepay (Chuyển khoản ngân hàng tự động qua VietQR).
    """
    
    @staticmethod
    async def create_payment_qr(user_id: str, package_name: str, amount: int, tx_code: str) -> dict:
        """
        Tạo mã QR chuyển khoản chứa nội dung tự động nhận diện transaction_code.
        """
        if not settings.BANK_ACCOUNT_NUMBER or not settings.BANK_ID:
            return {
                "qr_url": "",
                "transaction_code": tx_code,
                "amount": amount,
                "bank_account": "Chưa cấu hình",
                "bank_name": "Chưa cấu hình"
            }
            
        # API VietQR tạo ảnh QR tự động điền số tiền và nội dung chuyển khoản
        qr_url = f"https://img.vietqr.io/image/{settings.BANK_ID}-{settings.BANK_ACCOUNT_NUMBER}-compact2.png?amount={amount}&addInfo={tx_code}&accountName={settings.ACCOUNT_NAME}"
        
        return {
            "qr_url": qr_url,
            "transaction_code": tx_code,
            "amount": amount,
            "bank_account": settings.BANK_ACCOUNT_NUMBER,
            "bank_name": settings.BANK_ID
        }

    @staticmethod
    async def verify_transaction_from_webhook(webhook_data: dict) -> bool:
        """
        Xử lý kiểm tra tính hợp lệ thô từ webhook Sepay gửi về.
        """
        # Kiểm tra nếu đúng dữ liệu từ Sepay truyền sang và có số tiền lớn hơn 0
        return webhook_data.get("gateway") == "Sepay" and float(webhook_data.get("amount", 0)) > 0