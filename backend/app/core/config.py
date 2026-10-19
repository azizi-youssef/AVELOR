from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    PROJECT_NAME: str = "AVELOR Luxury Fashion"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "avelor-luxury-fashion-maroc-super-secret-key-change-in-prod-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Base de Données (PostgreSQL)
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/postgres"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Currency & E-commerce Settings
    CURRENCY: str = "MAD"
    FREE_SHIPPING_THRESHOLD: float = 500.0  # Gratuit au dessus de 500 MAD
    STANDARD_SHIPPING_FEE: float = 40.0     # 40 MAD par défaut

    # Initial Admin Setup
    FIRST_SUPERUSER_EMAIL: str = "admin@avelor.ma"
    FIRST_SUPERUSER_PASSWORD: str = "AdminAvelor2026!"

    # Supabase OAuth
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""  # Settings > API > JWT Secret

settings = Settings()

