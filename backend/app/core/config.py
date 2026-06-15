from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_hostname: str
    database_port: str
    database_password: str
    database_name: str
    database_username: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    debug: Optional[bool] = False
    hf_token: str | None = None
    ai_text_model_name: str = "typeform/distilbert-base-uncased-mnli"
    ai_text_study_label: str = "study related academic discussion"
    ai_text_non_study_label: str = "non-study social, promotional, or irrelevant discussion"
    ai_text_min_text_length: int = 3
    ai_text_max_text_length: int = 2000
    ai_image_model_name: str = "MobileNet_V3_Large_Weights.DEFAULT"
    ai_image_max_file_size_bytes: int = 10 * 1024 * 1024
    ai_image_top_k: int = 5
    ai_image_confidence_threshold: float = 0.45
    smart_search_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    smart_search_default_top_k: int = 5
    smart_search_max_top_k: int = 10
    smart_search_min_query_length: int = 3
    smart_search_min_similarity: float = 0.2
    smart_search_content_preview_length: int = 180
    smart_search_index_dir: str = "data/faiss_index"
    smart_search_posts_path: str = "data/search/sample_posts.json"
    smart_search_runtime_posts_path: str = "data/search/runtime_posts.json"
    class Config:
        env_file = ".env"


settings = Settings()
