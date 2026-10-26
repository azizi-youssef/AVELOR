from typing import List
from pydantic import field_validator
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

    # -------------------------------------------------------------------------
    # Sécurité — OBLIGATOIRE via .env, aucune valeur par défaut
    # -------------------------------------------------------------------------
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    # Token valide 24 h ; utiliser un refresh token pour sessions longues
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 heures

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError(
                "SECRET_KEY must be at least 32 characters. "
                "Set it in backend/.env (never commit this file)."
            )
        # Empêche d'utiliser la valeur d'exemple de l'ancien code
        forbidden = {"changeme", "secret", "change-in-prod", "avelor-luxury"}
        if any(bad in v.lower() for bad in forbidden):
            raise ValueError(
                "SECRET_KEY contains a weak/default phrase. "
                "Please generate a strong random key."
            )
        return v

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
    FREE_SHIPPING_THRESHOLD: float = 500.0  # Gratuit au-dessus de 500 MAD
    STANDARD_SHIPPING_FEE: float = 40.0     # 40 MAD par défaut

    # -------------------------------------------------------------------------
    # Compte admin initial — OBLIGATOIRE via .env
    # -------------------------------------------------------------------------
    FIRST_SUPERUSER_EMAIL: str = "admin@avelor.ma"
    FIRST_SUPERUSER_PASSWORD: str

    @field_validator("FIRST_SUPERUSER_PASSWORD")
    @classmethod
    def admin_password_must_be_set(cls, v: str) -> str:
        if not v or len(v) < 12:
            raise ValueError(
                "FIRST_SUPERUSER_PASSWORD must be at least 12 characters. "
                "Set it in backend/.env."
            )
        return v

    # Supabase OAuth (optionnel)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""  # Settings > API > JWT Secret

    # Rate limiting
    RATE_LIMIT_AUTH: str = "5/minute"        # Login / Register
    RATE_LIMIT_ORDERS: str = "10/minute"     # Création commande
    RATE_LIMIT_GLOBAL: str = "120/minute"    # Routes publiques


settings = Settings()

