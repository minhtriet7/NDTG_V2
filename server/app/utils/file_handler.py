from fastapi import UploadFile, HTTPException, status

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB giới hạn dung lượng

async def validate_and_read_image(file: UploadFile) -> bytes:
    """
    Hàm tiện ích:
    1. Kiểm tra đuôi file xem có phải ảnh hợp lệ không.
    2. Kiểm tra dung lượng (Max 5MB).
    3. Trả về bytes để đưa vào AI.
    """
    if not file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vui lòng tải lên một tệp tin.")

    # Kiểm tra định dạng mở rộng
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Định dạng {ext} không được hỗ trợ. Chỉ nhận: JPG, PNG, WEBP."
        )
    
    # Đọc file ra bytes
    file_bytes = await file.read()
    
    # Kiểm tra dung lượng
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Dung lượng tệp quá lớn. Giới hạn tối đa là 5MB."
        )
        
    return file_bytes