"""Application configuration loaded from environment."""

# Notes: lru_cache ensures settings are instantiated once
from functools import lru_cache

# Notes: BaseSettings parses environment variables into attributes
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Strongly typed settings object."""

    AGENT_TIMEOUT_SECONDS: int = 45
    """Controls max seconds an agent is allowed to run before timeout."""

    class Config:
        env_file = ".env"


# Notes: Provide a cached accessor for settings
@lru_cache()
def get_settings() -> AppSettings:
    """Return cached settings instance."""
    return AppSettings()
