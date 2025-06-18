"""Application configuration loaded from environment."""

# Notes: lru_cache ensures settings are instantiated once
from functools import lru_cache

# Notes: BaseSettings parses environment variables into attributes
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Strongly typed settings object."""

    AGENT_TIMEOUT_SECONDS: int = 45
    """Controls max seconds an agent is allowed to run before timeout."""

    # Notes: Maximum number of times to retry an agent before giving up
    MAX_AGENT_RETRIES: int = 2
    """Max retry attempts before agent failure is logged."""

    class Config:
        env_file = ".env"
        extra = "ignore"


# Notes: Provide a cached accessor for settings
@lru_cache()
def get_settings() -> AppSettings:
    """Return cached settings instance."""
    return AppSettings()
