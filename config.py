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

    class Config:
        env_file = ".env"


settings = Settings()


def get_settings() -> Settings:
    """Return a new Settings instance."""
    return Settings()

