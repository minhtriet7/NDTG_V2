from fastapi import APIRouter
from typing import List
from app.schemas.banknote_schema import BanknoteResponse
from app.controllers.banknote_controller import BanknoteController

router = APIRouter()

# API này mở Public (không cần đăng nhập) để ai cũng xem được danh mục
@router.get("/", response_model=List[BanknoteResponse])
async def get_all_banknotes():
    return await BanknoteController.get_all()

@router.get("/{banknote_id}", response_model=BanknoteResponse)
async def get_banknote_detail(banknote_id: str):
    return await BanknoteController.get_one(banknote_id)