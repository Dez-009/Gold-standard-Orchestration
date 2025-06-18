"""Tests for the feature toggle endpoints and route gating."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
# Enable only journal and pdf_export features for this test
import main
app = main.app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register_user() -> tuple[int, str]:
    """Create a user and return id and token."""
    email = f"ft_{uuid.uuid4().hex}@example.com"
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


def test_enabled_features_endpoint():
    """The endpoint should return the configured feature list."""
    _, token = register_user()
    resp = client.get(
        "/settings/enabled-features",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert set(resp.json()["enabled_features"]) == {
        "journal",
        "goals",
        "pdf_export",
        "agent_feedback",
    }


def test_disabled_route_unavailable():
    """Routes for disabled features should return 404."""
    resp = client.get("/daily-checkins")
    assert resp.status_code == 404
    resp = client.get("/journals")
    # Method not allowed because only POST is defined
    assert resp.status_code == 405
