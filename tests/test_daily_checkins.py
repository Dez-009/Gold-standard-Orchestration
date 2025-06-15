"""Tests for daily check-in endpoints."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Import the route module so we can patch the OpenAI client during tests
import routes.daily_checkin as daily_route

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


# Notes: Simple object mimicking the OpenAI completion response
class DummyCompletion:
    def __init__(self, content: str = "Test feedback") -> None:
        self.choices = [type("c", (), {"message": type("m", (), {"content": content})})]


def register_and_login(email: str) -> tuple[int, str]:
    """Register a user and return its id along with an auth token."""
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


def test_create_daily_checkin(monkeypatch):
    user_id, token = register_and_login(f"checkin_create_{uuid.uuid4().hex}@example.com")

    # Notes: Patch the OpenAI client to avoid external API calls during tests
    def fake_create(**kwargs):
        return DummyCompletion("Great job today")

    monkeypatch.setattr(daily_route.client.chat.completions, "create", fake_create)

    checkin_data = {
        "user_id": user_id,
        "mood": "happy",
        "energy_level": 8,
        "reflections": "Feeling good",
    }
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/daily-checkins/", json=checkin_data, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "checkin" in data and "feedback" in data
    checkin = data["checkin"]
    assert checkin["user_id"] == user_id
    for field in ["id", "user_id", "mood", "energy_level", "created_at", "updated_at"]:
        assert field in checkin
    assert isinstance(data["feedback"], str) and data["feedback"]


def test_get_daily_checkin_by_id(monkeypatch):
    user_id, token = register_and_login(f"checkin_get_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Avoid calling OpenAI when creating the check-in
    monkeypatch.setattr(daily_route.client.chat.completions, "create", lambda **_: DummyCompletion())

    create_resp = client.post(
        "/daily-checkins/",
        json={"user_id": user_id, "mood": "ok", "energy_level": 5},
        headers=headers,
    )
    assert create_resp.status_code in (200, 201)
    checkin_id = create_resp.json()["checkin"]["id"]
    resp = client.get(f"/daily-checkins/{checkin_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == checkin_id
    assert data["user_id"] == user_id


def test_get_daily_checkins_by_user(monkeypatch):
    user_id, token = register_and_login(f"checkin_list_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Patch OpenAI client to avoid external requests for each creation
    monkeypatch.setattr(daily_route.client.chat.completions, "create", lambda **_: DummyCompletion())

    for i in range(2):
        resp = client.post(
            "/daily-checkins/",
            json={"user_id": user_id, "mood": f"mood{i}", "energy_level": i},
            headers=headers,
        )
        assert resp.status_code in (200, 201)
    resp = client.get(f"/daily-checkins/user/{user_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
