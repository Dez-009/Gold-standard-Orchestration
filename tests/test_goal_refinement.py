"""Tests for the goal refinement endpoint."""

# Notes: Configure environment before importing the app
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


# Notes: Helper to create a user and return auth token
def register_and_login() -> tuple[int, str]:
    email = f"refine_{uuid4().hex}@example.com"
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


# Notes: Verify the refinement route returns the mocked list

def test_refine_goals(monkeypatch):
    user_id, token = register_and_login()

    # Notes: Patch the service so no external AI call is made
    import routes.goal as goal_routes

    def fake_refine(uid, goals, tags):
        return ["Improved goal 1", "Improved goal 2"]

    monkeypatch.setattr(goal_routes.goal_refinement_service, "refine_goals", fake_refine)

    headers = {"Authorization": f"Bearer {token}"}
    payload = {"existing_goals": ["Goal"], "journal_tags": ["tag"]}
    response = client.post("/goals/suggest-refined", json=payload, headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["refined_goals"] == ["Improved goal 1", "Improved goal 2"]
