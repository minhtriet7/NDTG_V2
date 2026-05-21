from app.schemas.currency_schema import ConvertRequest, ConvertResponse
from app.services.currency_service import CurrencyService

class CurrencyController:
    @staticmethod
    async def convert(data: ConvertRequest) -> ConvertResponse:
        result = await CurrencyService.convert_to_vnd(data)
        return result