"""Unit tests for the model logging service."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.model_logging_service import get_model_logs


def test_get_model_logs_length():
    """Service should return exactly 100 mocked records."""
    logs = get_model_logs()
    assert isinstance(logs, list)
    assert len(logs) == 100


def test_get_model_logs_fields():
    """Each log entry should include required keys."""
    log = get_model_logs()[0]
    for key in ["timestamp", "user_id", "provider", "model_name", "tokens_used", "latency_ms"]:
        assert key in log
