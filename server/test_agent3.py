import asyncio
import os
import json
# Import hàm run_agent3_lens từ file agent 3 vừa sửa ở trên
from app.agents.agent_3_lens import run_agent3_lens 

async def main():
    # Điền đường dẫn tới một ảnh tờ tiền thật trên máy bạn
    image_path = r"D:\LuanVanTotNghiep\dataset\200000_vnd\nam-mo-thay-tien-200-nghin-2.jpg" 

    if not os.path.exists(image_path):
        print(f"❌ Không tìm thấy ảnh tại: {image_path}")
        return

    print("🚀 Đang khởi động tiến trình kiểm tra Agent 3...")
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Gọi Agent 3 chạy
    result_json_str = await run_agent3_lens(image_bytes)
    
    print("\n--- KẾT QUẢ TỪ AGENT 3 (RAW JSON) ---")
    try:
        parsed_result = json.loads(result_json_str)
        print(json.dumps(parsed_result, indent=2, ensure_ascii=False))
    except Exception as e:
        print("Lỗi Parse JSON:", e)
        print("Chuỗi thô:", result_json_str)

if __name__ == "__main__":
    asyncio.run(main())