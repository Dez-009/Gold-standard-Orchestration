from functools import lru_cache
from pydantic_settings import BaseSettings

# ---------------------------------------------------------------------------
# Agent execution tuning constants used across the orchestration layer
# ---------------------------------------------------------------------------

# Default timeout in seconds for each agent invocation. All agent calls are
# wrapped in ``asyncio.wait_for`` using this value so any slow or hung agent is
# aborted after the configured number of seconds.
AGENT_TIMEOUT_SECONDS = 15

# Maximum number of retry attempts performed when an agent fails or times out.
# The executor will pause with a backoff delay between attempts. Lower values
# mean less resilience to transient failures, while larger values may prolong
# overall request time.
AGENT_MAX_RETRIES = 2

"""Execution tuning parameters controlling agent timeouts and retries.

The executor uses ``AGENT_TIMEOUT_SECONDS`` to cancel slow agent calls. When a
timeout or failure occurs, it will retry up to ``AGENT_MAX_RETRIES`` times with
an increasing backoff.  Tweaking these values lets operators balance response
latency with resiliency to transient errors.
"""

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


