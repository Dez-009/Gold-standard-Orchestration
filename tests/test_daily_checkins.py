"""Tests for the new health check-in endpoints."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)




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


def test_create_daily_checkin():
    user_id, token = register_and_login(f"checkin_create_{uuid.uuid4().hex}@example.com")

    checkin_data = {
        "mood": "GOOD",
        "energy_level": 8,
        "stress_level": 3,
        "notes": "Feeling good",
    }
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/checkins", json=checkin_data, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == user_id
    for field in ["id", "user_id", "mood", "energy_level", "stress_level", "created_at"]:
        assert field in data


def test_get_daily_checkin_by_id():
    user_id, token = register_and_login(f"checkin_get_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = client.post(
        "/checkins",
        json={"mood": "OKAY", "energy_level": 5, "stress_level": 4},
        headers=headers,
    )
    assert create_resp.status_code in (200, 201)
    checkin_id = create_resp.json()["id"]
    resp = client.get("/checkins", headers=headers)
    assert resp.status_code == 200
    data = resp.json()[0]
    assert data["id"] == checkin_id
    assert data["user_id"] == user_id


def test_get_daily_checkins_by_user():
    user_id, token = register_and_login(f"checkin_list_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    for i in range(2):
        resp = client.post(
            "/checkins",
            json={"mood": "GOOD", "energy_level": i + 1, "stress_level": 2},
            headers=headers,
        )
        assert resp.status_code in (200, 201)
    resp = client.get("/checkins", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
