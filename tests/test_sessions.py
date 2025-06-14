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
    password = "password123"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": password,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_create_session():
    user_id, token = register_and_login(f"session_create_{uuid.uuid4().hex}@example.com")
    session_data = {
        "user_id": user_id,
        "title": "Test Session",
        "ai_summary": "Summary",
        "conversation_history": "History",
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/sessions/", json=session_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    for field in ["id", "user_id", "title", "created_at", "updated_at"]:
        assert field in data
    assert data["user_id"] == user_id


def test_get_session_by_id():
    user_id, token = register_and_login(f"session_get_{uuid.uuid4().hex}@example.com")
    session_data = {"user_id": user_id}
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post("/sessions/", json=session_data, headers=headers)
    assert create_resp.status_code == 200
    session_id = create_resp.json()["id"]
    resp = client.get(f"/sessions/{session_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == session_id
    assert data["user_id"] == user_id


def test_get_sessions_by_user():
    user_id, token = register_and_login(f"session_list_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(2):
        session_data = {"user_id": user_id, "title": f"Session {i}"}
        resp = client.post("/sessions/", json=session_data, headers=headers)
        assert resp.status_code == 200
    resp = client.get(f"/sessions/user/{user_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
