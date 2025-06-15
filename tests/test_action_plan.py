"""Integration tests for the action plan endpoint."""

# Notes: Standard library imports for environment configuration
import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

# Notes: Ensure the project root is importable and environment variables are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import the FastAPI application and auth utility
from main import app
from auth.auth_utils import create_access_token

# Notes: Instantiate the TestClient
client = TestClient(app)


# Notes: Helper function to create a user and return auth token
def register_and_login() -> tuple[int, str]:
    email = f"action_plan_{uuid4().hex}@example.com"
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


# Notes: Verify the generate action plan route returns the mocked plan
def test_generate_action_plan(monkeypatch):
    user_id, token = register_and_login()

    # Notes: Patch the service call used in the route to avoid hitting OpenAI
    import routes.action_plan as action_routes

    def fake_generate(db, uid: int, goal: str) -> str:
        return "Mock Plan"

    monkeypatch.setattr(action_routes, "generate_action_plan", fake_generate)

    headers = {"Authorization": f"Bearer {token}"}
    payload = {"goal": "Get fit"}
    response = client.post("/action-plan/generate", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json() == {"action_plan": "Mock Plan"}
