"""Tests for the admin feedback listing endpoint."""

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
    """Create a user and return id and token."""
    email = f"afb_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def create_feedback(token: str, ftype: str = "Bug"):
    """Submit a feedback entry via the API."""
    resp = client.post(
        "/feedback/",
        json={"feedback_type": ftype, "message": "msg"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200


def test_requires_admin():
    """Non-admin users should be blocked from listing feedback."""
    _, token = register_user()
    resp = client.get("/admin/feedback", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_admin_can_filter():
    """Admin should receive paginated feedback filtered by type."""
    user_id, token = register_user()
    create_feedback(token, "Bug")
    create_feedback(token, "Praise")

    _, admin_token = register_user(role="admin")
    resp = client.get(
        "/admin/feedback?feedback_type=Praise",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert all(item["feedback_type"] == "Praise" for item in data)

