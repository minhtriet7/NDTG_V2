import os
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.banknote_model import Banknote

async def run_database_seeder():
    # Bước 1: Khởi tạo kết nối tới cơ sở dữ liệu MongoDB Atlas
    print("[Database Seeder] Dang ket noi toi MongoDB Atlas...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_name = settings.DATABASE_NAME

    # Khởi tạo cấu trúc Beanie mapping với Model Banknote
    await init_beanie(
        database=client[db_name],
        document_models=[Banknote]
    )
    print(f"[Database Seeder] Kich hoat phan vung database: {db_name}")

    # Bước 2: Dọn dẹp làm sạch dữ liệu cũ để tránh trùng lặp bản ghi
    print("[Database Seeder] Dang xoa du lieu cu trong collection banknotes...")
    await Banknote.find_all().delete()
    print("[Database Seeder] Lam sach phan vung cu hoan tat.")

    # Bước 3: Đọc tệp tin dữ liệu cấu trúc JSON vừa tạo
    json_file_path = os.path.join(os.path.dirname(__file__), "banknotes_data.json")
    if not os.path.exists(json_file_path):
        print(f"[Database Seeder] That bai: Khong tim thay file du lieu tai {json_file_path}")
        return

    with open(json_file_path, "r", encoding="utf-8") as f:
        banknotes_list = json.load(f)

    # Bước 4: Chuyển đổi dữ liệu và ép nạp hàng loạt vào MongoDB
    print(f"[Database Seeder] Phat hien {len(banknotes_list)} menh gia dung cau truc. Dang tien hanh gieo hat...")
    
    documents_to_insert = [Banknote(**item) for item in banknotes_list]
    await Banknote.insert_many(documents_to_insert)
    
    print(f"[Database Seeder] Thanh cong! Da nap day du {len(banknotes_list)} menh gia vao MongoDB Atlas.")

if __name__ == "__main__":
    # Kích hoạt luồng chạy bất đồng bộ cho tập lệnh độc lập
    asyncio.run(run_database_seeder())