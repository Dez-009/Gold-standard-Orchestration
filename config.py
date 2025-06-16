from functools import lru_cache
from pydantic_settings import BaseSettings

# Application version placeholder
VERSION = "1.0.0"


class Settings(BaseSettings):
    project_name: str = "Vida Coach API"
    openai_api_key: str
    environment: str = "development"
    port: int = 8000
    database_url: str
    RATE_LIMIT: str = "100/minute"
    # Notes: Secrets used for Stripe integration
    stripe_secret_key: str
    stripe_webhook_secret: str
    # Notes: Secret key for JWT token generation
    secret_key: str

    class Config:
        env_file = ".env"


# Notes: Use lru_cache so configuration is loaded from environment only once
@lru_cache()
def get_settings() -> Settings:
    """Return cached settings for the application."""
    return Settings()


