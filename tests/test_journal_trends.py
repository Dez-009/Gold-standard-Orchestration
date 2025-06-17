"""Integration tests for the journal trends API route."""

# Notes: Configure environment and import app before running tests
import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
import services.ai_processor as ai_processor

client = TestClient(app)


# Notes: Register a user and return id with authentication token
def register_and_login() -> tuple[int, str]:
    email = f"jt_route_{uuid.uuid4().hex}@example.com"
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


# Notes: Verify the /ai/journal-trends endpoint returns trend data
def test_journal_trends(monkeypatch):
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Create a sample journal entry so the endpoint can operate
    client.post(
        "/journals/",
        json={"user_id": user_id, "content": "testing trends"},
        headers=headers,
    )

    fake_data = {
        "id": "1",
        "user_id": user_id,
        "timestamp": "2020-01-01T00:00:00",
        "mood_summary": "good",
        "keyword_trends": {"testing": 1},
        "goal_progress_notes": "on track",
    }

    # Notes: Patch the service layer to avoid calling OpenAI
    import routes.journal_trends as jt_route
    monkeypatch.setattr(jt_route, "analyze_journal_trends", lambda db, uid: fake_data)

    response = client.get("/ai/journal-trends", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "mood_summary" in data
    assert data["goal_progress_notes"]
