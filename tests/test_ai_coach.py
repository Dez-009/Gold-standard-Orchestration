# Notes: Configure test environment variables before importing application modules
import os
import sys
from fastapi.testclient import TestClient

# Notes: Ensure relative imports work by adding project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Notes: Provide dummy values for required environment variables
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import the FastAPI application and token utility
from main import app
from auth.auth_utils import create_access_token

# Notes: Create a TestClient instance for making requests to the app
client = TestClient(app)


# Notes: Helper function to register a user and create an auth token
def register_and_login() -> tuple[int, str]:
    """Return newly created user's id and JWT token."""
    import uuid

    email = f"ai_coach_{uuid.uuid4().hex}@example.com"
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


# Notes: Verify that the AI coach endpoint returns a response when given a prompt
def test_ai_coach_response(monkeypatch):
    # Notes: Register user and obtain auth token
    _, token = register_and_login()

    # Notes: Patch the AI processor to avoid external API calls
    from services import ai_processor

    def fake_generate(db, user_id: int, prompt: str) -> str:
        return "Mocked AI reply"

    monkeypatch.setattr(ai_processor, "generate_ai_response", fake_generate)

    headers = {"Authorization": f"Bearer {token}"}
    payload = {"prompt": "Give me some life advice."}

    response = client.post("/ai/coach", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("response"), str)
    assert data["response"]


# Notes: Ensure validation error when prompt field is missing
def test_ai_coach_missing_prompt(monkeypatch):
    """Request without prompt should return validation error."""
    _, token = register_and_login()

    # Notes: Patch AI generation to avoid external call even though it won't run
    from services import ai_processor

    monkeypatch.setattr(ai_processor, "generate_ai_response", lambda *_: "")

    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/ai/coach", json={}, headers=headers)
    assert response.status_code == 400


# Notes: Verify AI coach response when user has existing memory records
def test_ai_coach_response_with_memory(monkeypatch):
    """Ensure AI responds even when previous context exists."""
    # Notes: Register user and get auth token
    user_id, token = register_and_login()

    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Create sample journal entry to serve as user memory
    entry_data = {"user_id": user_id, "content": "Today was productive."}
    journal_resp = client.post("/journals/", json=entry_data, headers=headers)
    assert journal_resp.status_code in (200, 201)

    # Notes: Patch AI processor to avoid calling external API
    from services import ai_processor

    def fake_generate(db, uid: int, prompt: str) -> str:
        return "Mocked memory based reply"

    monkeypatch.setattr(ai_processor, "generate_ai_response", fake_generate)

    payload = {"prompt": "How can I keep this momentum?"}
    response = client.post("/ai/coach", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("response"), str)
    assert data["response"]


# Notes: Verify goal suggestions endpoint returns a list of goals
def test_suggest_goals_endpoint(monkeypatch):
    """Ensure the suggest goals route responds with AI suggestions."""
    # Notes: Register user and acquire auth token
    _, token = register_and_login()

    # Notes: Patch the suggest_goals function used by the route
    import routes.ai_coach as ai_routes

    def fake_suggest(db, uid: int) -> str:
        return "1. Stay active\n2. Eat healthy"

    monkeypatch.setattr(ai_routes, "suggest_goals", fake_suggest)

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/ai/suggest-goals", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert data["suggestions"]
