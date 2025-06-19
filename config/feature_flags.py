from __future__ import annotations

"""Application feature flag configuration."""

from functools import lru_cache
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class FeatureFlags(BaseSettings):
    """Feature flag toggles loaded from environment."""

    journals: bool = True
    pdf_export: bool = True
    device_sync: bool = False

 codex/clean-up-legacy-code-and-confirm-tests
    class Config:
        env_prefix = "FEATURE_"
        env_file = ".env.test" if os.getenv("TESTING") == "true" else ".env"
        case_sensitive = False
        extra = "ignore"
=======
    model_config = SettingsConfigDict(
        env_prefix="FEATURE_",
        env_file=".env.test" if os.getenv("TESTING") == "true" else ".env",
        case_sensitive=False,
        extra="ignore",
    )
 main


@lru_cache()
def get_flags() -> FeatureFlags:
    """Return cached ``FeatureFlags`` instance."""

    return FeatureFlags()


def is_feature_enabled(key: str) -> bool:
    """Return ``True`` if feature ``key`` is enabled."""

    flags = get_flags()
    return bool(getattr(flags, key, False))
