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


def register_and_login() -> tuple[int, str]:
    """Register a user and return its id and auth token."""
    email = f"notify_{uuid.uuid4().hex}@example.com"
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


def test_daily_notification():
    _, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/notifications/daily", headers=headers)
    assert resp.status_code == 200
    assert resp.json().get("detail")


def test_weekly_notification():
    _, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/notifications/weekly", headers=headers)
    assert resp.status_code == 200
    assert resp.json().get("detail")


def test_action_notification():
    _, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/notifications/action", params={"reminder_text": "Do it"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json().get("detail")

