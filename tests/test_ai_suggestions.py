# Notes: Set up environment and imports for testing the AI suggestions endpoint
import os
import sys
from fastapi.testclient import TestClient

# Notes: Ensure project root is on the path and required env vars are set before app import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

# Notes: Instantiate a TestClient for interacting with the FastAPI app
client = TestClient(app)


# Notes: Helper to register a new user and return the user id with a valid JWT
def register_and_login() -> tuple[int, str]:
    import uuid

    email = f"ai_suggestion_{uuid.uuid4().hex}@example.com"
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


# Notes: Verify that the goal suggestion endpoint returns a string of suggestions
# Notes: and that the endpoint works when the user has some existing context

def test_suggest_goals(monkeypatch):
    # Notes: Register a user and obtain an auth token
    user_id, token = register_and_login()

    # Notes: Create a sample journal entry to provide some memory context
    headers = {"Authorization": f"Bearer {token}"}
    entry_data = {"user_id": user_id, "content": "Working on staying healthy"}
    journal_resp = client.post("/journals/", json=entry_data, headers=headers)
    assert journal_resp.status_code in (200, 201)

    # Notes: Patch the suggest_goals function used by the route to avoid
    # Notes: calling OpenAI during tests
    import routes.ai_coach as ai_routes

    def fake_suggest(db, uid: int) -> str:
        return "1. Exercise daily\n2. Eat more vegetables"

    monkeypatch.setattr(ai_routes, "suggest_goals", fake_suggest)

    # Notes: Make the request to the suggest-goals endpoint
    response = client.get("/ai/suggest-goals", headers=headers)

    # Notes: Validate successful response structure
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert isinstance(data["suggestions"], str)
    assert data["suggestions"]
