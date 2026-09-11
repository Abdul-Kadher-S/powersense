"""Application configuration loaded from environment variables."""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "HomeGuard AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Demo credentials
    DEMO_EMAIL: str = "demo@homeguard.ai"
    DEMO_PASSWORD: str = "demo123"

    # JWT
    JWT_SECRET: str = "homeguard-ai-demo-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # Supabase (optional — falls back to SQLite)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Gemini API (optional — falls back to manual entry)
    GEMINI_API_KEY: Optional[str] = None

    # Database
    DATABASE_URL: str = "sqlite:///./homeguard.db"

    # ML
    ML_MODELS_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "models")

    # Electricity rate (INR per kWh)
    ELECTRICITY_RATE: float = 8.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
