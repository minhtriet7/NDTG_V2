# app/models/config_model.py
from beanie import Document
from typing import Optional

class SystemConfig(Document):
    # 1. Agents Config
    timeout_seconds: int = 30
    max_retries: int = 3
    concurrent_limit: int = 5
    fallback_enabled: bool = True
    
    # 2. Aggregator Config
    strategy: str = "majority_vote"
    min_consensus_ratio: float = 0.66
    ml_weight: float = 1.0
    llm_weight: float = 1.0
    lens_weight: float = 1.0
    
    # 3. AI Model Config
    model_version: str = "yolov8m"
    confidence_threshold: float = 0.75
    endpoint_url: str = "http://localhost:8001/predict"
    use_gpu: bool = True
    
    # 4. Google Lens Config
    api_key: Optional[str] = None
    proxy_url: Optional[str] = None
    language_code: str = "vi"
    max_results: int = 5
    
    # 5. Settings Config
    app_name: str = "BanknoteAI"
    support_email: str = "support@banknoteai.com"
    max_upload_size_mb: int = 5
    maintenance_mode: bool = False

    class Settings:
        name = "system_configs"