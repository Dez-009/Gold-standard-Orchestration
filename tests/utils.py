import os
import pytest


def skip_if_ci() -> bool:
    """Return True when running in a CI environment."""
    return os.getenv("CI") == "true"

