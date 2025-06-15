"""Integration tests for habit endpoints."""

# Notes: Set up environment and import dependencies
import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


# Notes: Helper to register a new user and obtain a token
def register_and_login() -> tuple[int, str]:
    email = f"habit_{uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


# Notes: Verify a habit can be created
def test_create_habit():
    user_id, token = register_and_login()
    habit_data = {"user_id": user_id, "habit_name": "Exercise", "frequency": "daily"}
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/habits/", json=habit_data, headers=headers)
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["user_id"] == user_id
    for field in ["id", "habit_name", "frequency", "streak_count", "created_at"]:
        assert field in data


# Notes: Ensure habits can be listed for a user
def test_get_habits_by_user():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(2):
        payload = {"user_id": user_id, "habit_name": f"Habit {i}", "frequency": "daily"}
        resp = client.post("/habits/", json=payload, headers=headers)
        assert resp.status_code in (200, 201)
    resp = client.get(f"/habits/user/{user_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2


# Notes: Validate a habit can be logged
def test_log_habit():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post(
        "/habits/",
        json={"user_id": user_id, "habit_name": "Meditate", "frequency": "daily"},
        headers=headers,
    )
    assert create_resp.status_code in (200, 201)
    habit_id = create_resp.json()["id"]
    log_resp = client.put(f"/habits/{habit_id}/log", headers=headers)
    assert log_resp.status_code == 200
    logged = log_resp.json()
    assert logged["streak_count"] == 1


# Notes: Verify a habit can be deleted
def test_delete_habit():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post(
        "/habits/",
        json={"user_id": user_id, "habit_name": "Temp", "frequency": "daily"},
        headers=headers,
    )
    assert create_resp.status_code in (200, 201)
    habit_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/habits/{habit_id}", headers=headers)
    assert delete_resp.status_code == 204
    list_resp = client.get(f"/habits/user/{user_id}", headers=headers)
    assert list_resp.status_code == 200
    habits = list_resp.json()
    assert all(h["id"] != habit_id for h in habits)
