"""Tests for the agent failure log model and admin endpoint."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.agent_failure_log import log_final_failure
from services.user_service import create_user
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_admin_user(db: TestingSessionLocal):
    """Helper to create an admin and return token."""
    admin = create_user(
        db,
        {
            "email": f"af_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
            "role": "admin",
        },
    )
    token = create_access_token({"user_id": admin.id})
    return admin.id, token


def test_log_and_list_failures():
    """Logging a failure should surface via the admin endpoint."""
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "user@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log_final_failure(db, user.id, "career", "timeout")
    admin_id, token = create_admin_user(db)
    db.close()

    resp = client.get(
        "/admin/agents/failures",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["count"] >= 1
    assert any(r["agent_name"] == "career" for r in payload["results"])


