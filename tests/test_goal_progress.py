import os
import sys
from fastapi.testclient import TestClient
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)

def register_and_login(email: str):
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


def test_update_goal_progress():
    user_id, token = register_and_login(f"goal_prog_{uuid.uuid4().hex}@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    goal_resp = client.post(
        "/goals/",
        json={"user_id": user_id, "title": "Goal", "target": 100},
        headers=headers,
    )
    assert goal_resp.status_code in (200, 201)
    goal_id = goal_resp.json()["id"]

    update_resp = client.put(
        f"/goals/{goal_id}/progress",
        json={"progress": 20},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["progress"] == 20
