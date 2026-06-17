from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, AnyHttpUrl
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Personal Workspace"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # Database
    DATABASE_URL: PostgresDsn
    
    # Redis
    REDIS_URL: str

    # AI
    OPENAI_API_KEY: str

    # Security
    SECRET_KEY: str = "supersecretkeychangeinproduction1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
