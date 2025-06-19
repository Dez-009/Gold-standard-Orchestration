from tests.utils import skip_if_ci
"""Integration tests for the action plan endpoint."""

# Notes: Standard library imports for environment configuration
import os
import sys
from uuid import uuid4
import pytest
from factories.user_factory import create_user

# Notes: Ensure the project root is importable and environment variables are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import the FastAPI application and auth utility
from main import app
from auth.auth_utils import create_access_token



def register_and_login(db):
    """Create a user via factory and return auth token."""
    user = create_user(db)
    token = create_access_token({"user_id": user.id})
    return user.id, token


# Notes: Verify the generate action plan route returns the mocked plan
@pytest.mark.skipif(skip_if_ci(), reason="CI environment missing keys")
def test_generate_action_plan(client, db_session, monkeypatch):
    # Notes: Register a test user and obtain an auth token
    user_id, token = register_and_login(db_session)

    # Notes: Patch the service layer to avoid calling OpenAI during the test
    import routes.action_plan as action_routes

    def fake_generate(db, uid: int, goal: str) -> str:
        return "Mock Plan"

    monkeypatch.setattr(action_routes, "generate_action_plan", fake_generate)

    # Notes: Call the endpoint with a sample goal
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"goal": "Get fit"}
    response = client.post("/action-plan/generate", json=payload, headers=headers)

    # Notes: Validate the response contains a non-empty action plan string
    assert response.status_code == 200
    data = response.json()
    assert "action_plan" in data
    assert isinstance(data["action_plan"], str)
    assert data["action_plan"]


# Notes: Ensure a validation error occurs when the goal is missing
def test_action_plan_missing_goal(client, db_session, monkeypatch):
    # Notes: Register a user and acquire an auth token
    _, token = register_and_login(db_session)

    # Notes: Patch service so no external call happens even though it won't run
    import routes.action_plan as action_routes
    monkeypatch.setattr(action_routes, "generate_action_plan", lambda *_: "")

    # Notes: Submit a request without a goal field
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/action-plan/generate", json={}, headers=headers)

    # Notes: FastAPI should return a validation error for the missing goal
    assert response.status_code == 422
