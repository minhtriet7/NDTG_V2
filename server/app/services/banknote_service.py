from fastapi import HTTPException
from app.models.banknote_model import Banknote

class BanknoteService:
    @staticmethod
    async def get_all_banknotes():
        # Lấy toàn bộ danh sách tiền giấy trong DB
        banknotes = await Banknote.find_all().to_list()
        
        # CHUYỂN ĐỔI OBJECT_ID SANG STRING
        results = []
        for note in banknotes:
            # Lấy dữ liệu dạng dict (Tương thích mọi phiên bản Pydantic)
            data = note.model_dump() if hasattr(note, 'model_dump') else note.dict()
            
            # Ép kiểu ID thành chuỗi chữ
            data["id"] = str(note.id)
            results.append(data)
            
        return results

    @staticmethod
    async def get_banknote_by_id(banknote_id: str):
        # Lấy chi tiết 1 tờ tiền
        banknote = await Banknote.get(banknote_id)
        if not banknote:
            raise HTTPException(status_code=404, detail="Banknote not found")
            
        data = banknote.model_dump() if hasattr(banknote, 'model_dump') else banknote.dict()
        data["id"] = str(banknote.id)
        
        return data