from app.services.banknote_service import BanknoteService

class BanknoteController:
    @staticmethod
    async def get_all():
        return await BanknoteService.get_all_banknotes()

    @staticmethod
    async def get_one(banknote_id: str):
        return await BanknoteService.get_banknote_by_id(banknote_id)