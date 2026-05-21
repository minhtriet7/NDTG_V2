import uuid
from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.models.user_model import User
from app.models.transaction_model import Transaction  # 🌟 IMPORT ĐỂ LƯU LỊCH SỬ GIAO DỊCH
from app.core.dependencies import get_current_user

router = APIRouter()

# Cơ chế Fallback giữ nguyên giúp giao diện luôn mượt mà
PACKAGES = [
    { "id": "pkg_1", "name": "Starter Pack", "tokens": 50, "price_vnd": 50000, "price_usd": 2, "description": "Gói cơ bản" },
    { "id": "pkg_2", "name": "Pro Pack", "tokens": 200, "price_vnd": 150000, "price_usd": 6, "description": "Gói chuyên nghiệp" },
    { "id": "pkg_3", "name": "Enterprise Pack", "tokens": 1000, "price_vnd": 500000, "price_usd": 20, "description": "Gói doanh nghiệp" }
]

class CreateTransactionRequestLocal(BaseModel):
    package_id: str
    gateway: Optional[str] = "sepay" 

@router.get("/token-packages")
async def get_all_active_packages():
    return PACKAGES

@router.post("/buy")
async def buy_tokens(
    data: CreateTransactionRequestLocal, 
    current_user: User = Depends(get_current_user)
):
    # Tìm thông tin gói trong bộ nhớ tạm thời
    pkg = next((p for p in PACKAGES if p["id"] == data.package_id), None)
    if not pkg:
        raise HTTPException(status_code=404, detail="Gói token không tồn tại trên hệ thống.")

    # 🌟 SỬA LỖI 400: Đồng bộ cổng "bank_transfer" từ FE về chung cụm xử lý với "sepay"
    gateway_type = data.gateway
    if gateway_type == "bank_transfer":
        gateway_type = "sepay"

    # -------------------------------------------------------------
    # THẾ TRẬN 1: LUỒNG THANH TOÁN THẬT QUA SEPAY (VIETQR AUTOMATIC)
    # -------------------------------------------------------------
    if gateway_type == "sepay":
        unique_memo = f"NAPTOKEN{str(current_user.id)[-4:]}{str(uuid.uuid4()).upper()[:4]}"
        
        bank_id = "VCB"
        account_number = "1031506356"
        account_name = "HUYNH NGUYEN MINH TRIET"
        amount = pkg["price_vnd"]
        
        qr_url = f"https://img.vietqr.io/image/{bank_id}-{account_number}-compact2.jpg?amount={amount}&addInfo={unique_memo}&accountName={account_name}"
        
        # 🌟 ĐỒNG BỘ SERVER: Khởi tạo hóa đơn ở trạng thái "pending" (Chờ duyệt) vào MongoDB
        transaction = Transaction(
            user_id=str(current_user.id),
            package_id=pkg["id"],
            amount=amount,
            tokens_added=pkg["tokens"],
            status="pending",
            payment_gateway="sepay",
            transaction_code=unique_memo
        )
        await transaction.insert() # Lưu vào bộ nhớ DB
        
        return {
            "id": str(transaction.id), # Trả thêm ID hóa đơn về cho FE quản lý
            "qr_url": qr_url,
            "bank_name": "Vietcombank (VCB)",
            "bank_account": account_number,
            "account_name": account_name,
            "amount": amount,
            "transaction_code": unique_memo,
            "tokens_added": pkg["tokens"],
            "is_mock": False
        }

    # -------------------------------------------------------------
    # THẾ TRẬN 2: LUỒNG THANH TOÁN GIẢ LẬP (MOCK) ĐỂ TEST NHANH
    # -------------------------------------------------------------
    elif gateway_type == "mock":
        current_user.token_balance += pkg["tokens"]
        await current_user.save()
        
        # 🌟 ĐỒNG BỘ SERVER: Lưu lịch sử nạp giả lập thành công ("success") vào DB luôn
        transaction = Transaction(
            user_id=str(current_user.id),
            package_id=pkg["id"],
            amount=pkg["price_vnd"],
            tokens_added=pkg["tokens"],
            status="success",
            payment_gateway="mock",
            transaction_code=f"MOCK_{str(uuid.uuid4()).upper()[:6]}"
        )
        await transaction.insert()
        
        return {
            "id": str(transaction.id),
            "qr_url": "",
            "bank_name": "Hệ Thống Giả Lập",
            "bank_account": "0000000000",
            "account_name": "MOCK PAYMENT SYSTEM",
            "amount": 0,
            "transaction_code": transaction.transaction_code,
            "tokens_added": pkg["tokens"],
            "is_mock": True
        }

    raise HTTPException(status_code=400, detail="Cổng thanh toán không được hỗ trợ.")

# 3. API xử lý Webhook tự động khi ngân hàng chuyển tiền thật về
@router.post("/webhook/sepay")
async def payment_sepay_webhook(request: Request):
    try:
        webhook_payload = await request.json()
        print("📩 [SePay Webhook] Nhận dữ liệu giao dịch thật từ ngân hàng:", webhook_payload)
        
        transaction_content = webhook_payload.get("transactionContent", "").upper()
        transfer_amount = int(webhook_payload.get("transferAmount", 0))
        
        if "NAPTOKEN" in transaction_content:
            all_users = await User.find_all().to_list()
            for user in all_users:
                user_suffix = str(user.id)[-4:]
                if f"NAPTOKEN{user_suffix}" in transaction_content:
                    matched_pkg = next((p for p in PACKAGES if transfer_amount >= p["price_vnd"]), None)
                    if matched_pkg:
                        # Cộng token cho người dùng
                        user.token_balance += matched_pkg["tokens"]
                        await user.save()
                        
                        # 🌟 ĐỒNG BỘ SERVER: Cập nhật trạng thái hóa đơn Chờ (pending) thành Thành công (success)
                        # Tìm hóa đơn theo mã code chuyển khoản xuất hiện trong nội dung
                        db_tx = await Transaction.find_one(Transaction.transaction_code == transaction_content)
                        if db_tx:
                            db_tx.status = "success"
                            await db_tx.save()

                        print(f"✅ SePay: Nạp tiền thật thành công! Đã cộng {matched_pkg['tokens']} token cho {user.full_name}")
                        return {"status": "success", "message": "Nạp tiền thành công"}
                        
            print("⚠️ Không tìm thấy người dùng có mã khớp với nội dung chuyển khoản.")
        return {"status": "ignored", "message": "Nội dung chuyển tiền không hợp lệ."}
    except Exception as e:
        print("❌ Lỗi xử lý Webhook SePay:", str(e))
        return {"status": "error", "message": str(e)}