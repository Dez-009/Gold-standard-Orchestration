"""Tests for journal AI source tagging feature."""

import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register(email: str) -> tuple[int, str]:
    """Create a user and return (id, token)."""
    import uuid

    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "pw",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id, "role": "admin"})
    return user_id, token


def test_admin_can_mark_ai_generated():
    user_id, token = register("ai_test@example.com")
    headers = {"Authorization": f"Bearer {token}", "X-Orchestrated": "true"}
    entry = {"user_id": user_id, "content": "AI text", "ai_generated": True}
    resp = client.post("/journals/", json=entry, headers=headers)
    assert resp.status_code in (200, 201)
    assert resp.json()["ai_generated"] is True


def test_user_cannot_mark_ai_generated():
    user_id, _ = register("user_test@example.com")
    token = create_access_token({"user_id": user_id})
    headers = {"Authorization": f"Bearer {token}"}
    entry = {"user_id": user_id, "content": "bad", "ai_generated": True}
    resp = client.post("/journals/", json=entry, headers=headers)
    assert resp.status_code == 403

