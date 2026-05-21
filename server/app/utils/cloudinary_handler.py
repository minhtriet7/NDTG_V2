import cloudinary
import cloudinary.uploader
import asyncio
from app.core.config import settings

# Cấu hình Cloudinary từ biến môi trường (.env)
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_image_to_cloudinary(image_bytes: bytes) -> str:
    """
    Hàm upload ảnh lên Cloudinary. 
    Chạy trong luồng riêng để không làm nghẽn FastAPI (do thư viện Cloudinary mặc định là đồng bộ).
    """
    def _upload():
        result = cloudinary.uploader.upload(
            image_bytes,
            folder="banknote_scans" # Lưu vào thư mục riêng trên Cloudinary
        )
        return result.get("secure_url")

    try:
        url = await asyncio.to_thread(_upload)
        return url
    except Exception as e:
        print(f"Lỗi upload Cloudinary: {e}")
        return ""