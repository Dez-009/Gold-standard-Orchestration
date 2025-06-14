import os
import sys
from fastapi.testclient import TestClient
import uuid

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


def test_create_goal():
    user_id, token = register_and_login(f"goal_create_{uuid.uuid4().hex}@example.com")
    goal_data = {
        "user_id": user_id,
        "title": "Test Goal",
        "description": "Description",
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/goals/", json=goal_data, headers=headers)
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["user_id"] == user_id
    for field in ["id", "user_id", "title", "created_at", "updated_at"]:
        assert field in data


def test_get_goal_by_id():
    user_id, token = register_and_login(f"goal_get_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post("/goals/", json={"user_id": user_id, "title": "Goal"}, headers=headers)
    assert create_resp.status_code in (200, 201)
    goal_id = create_resp.json()["id"]
    resp = client.get(f"/goals/{goal_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == goal_id
    assert data["user_id"] == user_id


def test_get_goals_by_user():
    user_id, token = register_and_login(f"goal_list_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(2):
        goal_data = {"user_id": user_id, "title": f"Goal {i}"}
        resp = client.post("/goals/", json=goal_data, headers=headers)
        assert resp.status_code in (200, 201)
    resp = client.get(f"/goals/user/{user_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
