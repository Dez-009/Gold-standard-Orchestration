"""Tests for the admin model logs API endpoint."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user and return id plus token."""
    email = f"log_{uuid.uuid4().hex}@example.com"
    data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=data)
    assert resp.status_code in (200, 201)
    uid = resp.json()["id"]
    token = create_access_token({"user_id": uid})
    return uid, token


def test_model_logs_requires_admin():
    """Non-admin users should receive 403 from the endpoint."""
    _, token = register_user()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/admin/model-logs", headers=headers)
    assert resp.status_code == 403


def test_model_logs_returns_data_for_admin():
    """Admin users should receive mocked log records."""
    _, token = register_user(role="admin")
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/admin/model-logs", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 100
