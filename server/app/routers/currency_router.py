from fastapi import APIRouter
from app.schemas.currency_schema import ConvertRequest, ConvertResponse
from app.controllers.currency_controller import CurrencyController

router = APIRouter()

@router.post("/convert", response_model=ConvertResponse)
async def convert_currency(data: ConvertRequest):
    return await CurrencyController.convert(data)

from fastapi import APIRouter

router = APIRouter(prefix="/currency", tags=["Currency"])

@router.get("/rates")
async def get_mock_rates():
    return {
      "base": 'USD',
      "source": 'Mock API Backend',
      "rates": { "USD": 1, "VND": 25450, "THB": 36.8, "SGD": 1.35, "MYR": 4.75, "IDR": 16100 }
    }

@router.get("/rates")
async def get_rates():
    return {"rates": {"USD": 1, "VND": 25450}}