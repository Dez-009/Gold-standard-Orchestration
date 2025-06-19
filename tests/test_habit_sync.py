"""Tests for habit sync service and endpoints."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import user_service
from database.session import engine
from database.base import Base
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    """Recreate tables for an isolated test DB."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def create_user(role: str = "user") -> tuple[int, str]:
    """Helper to create a user and return id and JWT token."""
    email = f"habit_{uuid.uuid4().hex}@example.com"
    user = user_service.create_user(
        TestingSessionLocal(),
        {
            "email": email,
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": role,
        },
    )
    token = create_access_token({"user_id": user.id})
    return user.id, token


def test_sync_and_summary():
    """POST /habit-sync/sync should store data and summary returns averages."""
    db = setup_db()
    user_id, token = create_user()

    # Notes: Trigger a habit sync via the endpoint
    resp = client.post(
        "/habit-sync/sync",
        json={"source": "fitbit"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["steps"] >= 0

    # Notes: Request summary to confirm data retrieval
    resp2 = client.get(
        "/habit-sync/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp2.status_code == 200
    summary = resp2.json()
    assert "steps" in summary
    assert "sleep_hours" in summary
    db.close()
