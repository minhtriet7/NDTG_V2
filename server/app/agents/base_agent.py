from abc import ABC, abstractmethod
import json

class BaseAgent(ABC):
    """
    Khuôn mẫu gốc (Interface) cho tất cả các Agent trong hệ thống Multi-Agent.
    Mọi Agent (YOLO, LLM, Lens) đều nên kế thừa class này nếu bác muốn code chuẩn OOP.
    """
    def __init__(self, agent_name: str):
        self.agent_name = agent_name

    @abstractmethod
    async def run(self, image_bytes: bytes, context: str = "") -> str:
        """
        Hàm thực thi chính bắt buộc phải có ở mọi Agent.
        - Trả về: Chuỗi JSON tuân thủ đúng JSON_TEMPLATE của hệ thống.
        """
        pass

    def get_error_response(self, error_message: str) -> str:
        """Hàm dùng chung để trả về lỗi đúng định dạng JSON"""
        error_data = [{
            "quoc_gia": "Lỗi",
            "menh_gia": "Lỗi",
            "mat_tien": "Lỗi",
            "nam_phat_hanh": "Lỗi",
            "chat_lieu": "Lỗi",
            "mo_ta": "Lỗi",
            "quan_diem": f"{self.agent_name} gặp sự cố: {error_message}",
            "phuong_phap": self.agent_name
        }]
        return json.dumps(error_data, ensure_ascii=False)