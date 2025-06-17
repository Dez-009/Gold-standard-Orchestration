"""Tests for journal tagging endpoint."""

# Notes: Configure environment and imports
import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

# Notes: Ensure the project root is importable and set env vars before app import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


# Notes: Helper to create a user and return id plus auth token

def register_and_login() -> tuple[int, str]:
    email = f"tagging_{uuid4().hex}@example.com"
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


# Notes: Verify analyze-tags returns the mocked tags list

def test_analyze_journal_tags(monkeypatch):
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Create a sample journal entry for context
    entry_data = {"user_id": user_id, "content": "I want to grow my career and lead."}
    resp = client.post("/journals/", json=entry_data, headers=headers)
    assert resp.status_code in (200, 201)

    # Notes: Patch the AI adapter generate method so no external call is made
    import services.journal_tagging_service as tagging_service

    def fake_generate(self, messages, temperature=0.3):
        return '{"tags": ["career", "leadership"]}'

    monkeypatch.setattr(tagging_service.AIModelAdapter, "generate", fake_generate)

    response = client.get("/journals/analyze-tags", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["tags"] == ["career", "leadership"]


# Notes: When no journals exist the endpoint should return an empty list

def test_analyze_tags_no_journals(monkeypatch):
    _, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    import services.journal_tagging_service as tagging_service

    # Notes: Even if AI returns something, service should handle empty history
    monkeypatch.setattr(
        tagging_service.AIModelAdapter,
        "generate",
        lambda *_, **__: '{"tags": ["test"]}',
    )

    response = client.get("/journals/analyze-tags", headers=headers)
    assert response.status_code == 200
    assert response.json()["tags"] == []
