"""Application configuration loaded from environment."""

# Notes: lru_cache ensures settings are instantiated once
from functools import lru_cache
from pathlib import Path
import json
import yaml
import os
from utils.logger import get_logger

# Notes: BaseSettings parses environment variables into attributes
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Strongly typed settings object."""

    # Database configuration
    database_url: str = "sqlite:///./vida.db"
    """Database connection URL."""

    # Authentication configuration
    secret_key: str = "your-secret-key-change-in-production"
    """Secret key for JWT token signing."""

    # Application configuration
    environment: str = "development"
    """Application environment (development, staging, production)."""

    port: int = 8000
    """Port for the FastAPI server."""

    # Agent configuration
    AGENT_TIMEOUT_SECONDS: int = 45
    """Controls max seconds an agent is allowed to run before timeout."""

    # Notes: Maximum number of times to retry an agent before giving up
    MAX_AGENT_RETRIES: int = 2
    """Max retry attempts before agent failure is logged."""

    DEBUG_MODE: bool = True
    """Global toggle for displaying debug banners in admin UI."""

    # Path to YAML/JSON file containing model pricing
    MODEL_PRICING_FILE: str = "config/model_pricing.yaml"
    """Filesystem path to the model pricing configuration file."""

    model_pricing: dict[str, float] = {}
    """Mapping of model name to cost per thousand tokens."""

    # Optional API keys
    openai_api_key: str = ""
    """OpenAI API key for AI features."""

    stripe_secret_key: str = ""
    """Stripe secret key for payments."""

    stripe_webhook_secret: str = ""
    """Stripe webhook secret for payment events."""

    stripe_publishable_key: str = ""
    """Stripe publishable key for frontend."""

    def __init__(self, **data):
        super().__init__(**data)
        self.model_pricing = self._load_model_pricing()

    _logger = get_logger()

    def _load_model_pricing(self) -> dict[str, float]:
        """Load pricing data from YAML/JSON file."""
        path = Path(self.MODEL_PRICING_FILE)
        if not path.exists():
            self._logger.warning("model_pricing file %s missing; using defaults", path)
            return {"default": 0.002}
        try:
            with path.open("r") as fh:
                if path.suffix in {".yaml", ".yml"}:
                    return yaml.safe_load(fh) or {}
                return json.load(fh)
        except Exception:  # pragma: no cover - use defaults on failure
            self._logger.warning("Failed to load pricing file %s", path)
            return {"default": 0.002}

    class Config:
        env_file = ".env.test" if os.getenv("TESTING") == "true" else ".env"
        extra = "ignore"
        protected_namespaces = ('settings_',)  # Fix pydantic warning about model_ prefix


# Notes: Provide a cached accessor for settings
@lru_cache()
def get_settings() -> AppSettings:
    """Return cached settings instance."""
    return AppSettings()
