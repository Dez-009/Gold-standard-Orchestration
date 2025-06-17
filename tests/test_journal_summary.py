"""Integration test for the journal summary endpoint."""

# Notes: Configure environment and imports before loading the app
import os
import sys
from fastapi.testclient import TestClient

# Notes: Ensure the project root is importable and env vars are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

# Notes: Instantiate TestClient for making requests
client = TestClient(app)


# Notes: Helper to register a user and return id with auth token
def register_and_login() -> tuple[int, str]:
    import uuid

    email = f"journal_summary_{uuid.uuid4().hex}@example.com"
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


# Notes: Validate that the journal summary endpoint returns a summary string

def test_journal_summary(monkeypatch):
    # Notes: Register a user and obtain token
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Create sample journal entries for the user
    for i in range(2):
        entry = {"user_id": user_id, "content": f"Entry {i}"}
        resp = client.post("/journals/", json=entry, headers=headers)
        assert resp.status_code in (200, 201)

    # Notes: Patch the summarization service to avoid calling OpenAI
    import services.ai_processor as ai_processor
    monkeypatch.setattr(ai_processor, "generate_journal_summary", lambda *_: "Mock Summary")

    # Notes: Request the journal summary
    response = client.get("/ai/journal-summary", headers=headers)

    # Notes: Verify a successful response containing a summary string
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert isinstance(data["summary"], str)
    assert data["summary"]
