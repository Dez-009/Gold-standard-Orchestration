"""Tests for persona token assignment service."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import persona_token_service, user_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_test_user(db: TestingSessionLocal):
    """Helper to create a user for token tests."""
    return user_service.create_user(
        db,
        {
            "email": f"token_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )


def test_assign_and_get_token():
    """Verify tokens can be assigned and retrieved."""
    db = TestingSessionLocal()
    user = create_test_user(db)
    record = persona_token_service.assign_token(db, user.id, "quick_rebounder")
    assert record.user_id == user.id
    fetched = persona_token_service.get_token(db, user.id)
    assert fetched is not None
    assert fetched.token_name == "quick_rebounder"
    db.close()
