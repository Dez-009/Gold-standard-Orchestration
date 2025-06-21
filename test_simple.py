import os
import sys
import pytest
from unittest.mock import patch

# Set environment variables for testing
os.environ["TESTING"] = "true"
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["OPENAI_API_KEY"] = "test"
os.environ["STRIPE_SECRET_KEY"] = "sk_test"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test"
os.environ["SECRET_KEY"] = "test"
os.environ["RATE_LIMIT"] = "100/minute"

# Test basic imports
def test_config_import():
    """Test that config can be imported."""
    from config import get_settings
    settings = get_settings()
    assert settings.database_url == "sqlite:///:memory:"
    assert settings.openai_api_key == "test"

def test_database_import():
    """Test that database models can be imported."""
    from models.user import User
    from models.journal_entry import JournalEntry
    assert User is not None
    assert JournalEntry is not None

def test_services_import():
    """Test that services can be imported."""
    from services import user_service
    assert user_service is not None

def test_utils_import():
    """Test that utilities can be imported."""
    from utils.logger import get_logger
    logger = get_logger()
    assert logger is not None

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 