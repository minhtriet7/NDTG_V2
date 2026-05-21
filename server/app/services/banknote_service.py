from fastapi import HTTPException
from app.models.banknote_model import Banknote

class BanknoteService:
    @staticmethod
    async def get_all_banknotes():
        # Lấy toàn bộ danh sách tiền giấy trong DB
        banknotes = await Banknote.find_all().to_list()
        return banknotes

    @staticmethod
    async def get_banknote_by_id(banknote_id: str):
        # Lấy chi tiết 1 tờ tiền
        banknote = await Banknote.get(banknote_id)
        if not banknote:
            raise HTTPException(status_code=404, detail="Banknote not found")
        return banknote