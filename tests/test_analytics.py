"""Tests for analytics event endpoint."""

import os
import sys
import uuid
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register_and_login() -> tuple[int, str]:
    email = f"ae_{uuid.uuid4().hex}@example.com"
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


def test_post_event_authenticated():
    user_id, token = register_and_login()
    payload = {"page": "dashboard"}
    resp = client.post(
        "/analytics/event",
        json={"event_type": "page_view", "event_payload": payload},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["event_type"] == "page_view"
    assert json.loads(data["event_payload"])["page"] == "dashboard"


def test_post_event_anonymous():
    payload = {"page": "login"}
    resp = client.post(
        "/analytics/event",
        json={"event_type": "page_view", "event_payload": payload},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] is None
    assert json.loads(data["event_payload"])["page"] == "login"
