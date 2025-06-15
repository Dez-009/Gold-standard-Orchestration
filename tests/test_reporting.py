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


def test_reporting_summary():
    resp = client.get("/reporting/summary")
    assert resp.status_code == 200
    initial = resp.json()

    user_id, token = register_and_login(f"report_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/journals/", json={"user_id": user_id, "content": "entry"}, headers=headers)
    client.post("/goals/", json={"user_id": user_id, "title": "Goal"}, headers=headers)
    client.post(
        "/daily-checkins/",
        json={"user_id": user_id, "mood": "ok", "energy_level": 5},
        headers=headers,
    )

    resp = client.get("/reporting/summary")
    assert resp.status_code == 200
    new = resp.json()

    assert new["total_users"] >= initial["total_users"] + 1
    assert new["total_journals"] >= initial["total_journals"] + 1
    assert new["total_goals"] >= initial["total_goals"] + 1
    assert new["total_checkins"] >= initial["total_checkins"] + 1
