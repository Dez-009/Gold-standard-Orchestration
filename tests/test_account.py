"""Integration tests for the account endpoint."""

# Notes: Set up path and env so the application can be imported
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import application and token utility
from main import app
from auth.auth_utils import create_access_token

# Notes: Instantiate the TestClient for making HTTP requests
client = TestClient(app)


# Notes: Helper to register a user and obtain a token
def register_and_login() -> tuple[int, str]:
    """Create a user and return their id and JWT."""
    import uuid

    email = f"account_{uuid.uuid4().hex}@example.com"
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


# Notes: Validate that the /account endpoint returns placeholder info
def test_get_account_details():
    """Endpoint should respond with subscription and billing data."""
    _, token = register_and_login()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/account", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["tier"] == "Free"
    assert "billing" in data


# Notes: Ensure deleting the account removes authentication
def test_delete_account():
    """Account deletion should revoke access to protected endpoints."""
    _, token = register_and_login()

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.delete("/account/delete", headers=headers)
    assert resp.status_code == 204

    # Notes: Subsequent requests with the same token should fail
    resp_check = client.get("/account", headers=headers)
    assert resp_check.status_code == 401
