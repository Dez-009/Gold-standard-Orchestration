"""Tests for the feedback submission endpoint."""

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


def register_user() -> tuple[int, str]:
    """Helper to create a user and return id and token."""
    email = f"fb_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_submit_authenticated_feedback():
    """Feedback should link to user when token provided."""
    user_id, token = register_user()
    payload = {"feedback_type": "Bug", "message": "broken"}
    resp = client.post("/feedback/", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["feedback_type"] == "Bug"
    assert data["message"] == "broken"


def test_submit_anonymous_feedback():
    """Feedback without token should store null user_id."""
    payload = {"feedback_type": "Praise", "message": "great"}
    resp = client.post("/feedback/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] is None
    assert data["feedback_type"] == "Praise"

