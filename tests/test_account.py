"""Integration tests for the account endpoint."""

# Notes: Set up path and env so the application can be imported
import os
import sys
from factories.user_factory import create_user

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import application and token utility
from main import app
from auth.auth_utils import create_access_token


def register_and_login(db):
    """Create a test user using the factory and return auth token."""
    user = create_user(db)
    token = create_access_token({"user_id": user.id})
    return user.id, token


# Notes: Validate that the /account endpoint returns placeholder info
def test_get_account_details(client, db_session):
    """Endpoint should respond with subscription and billing data."""
    _, token = register_and_login(db_session)

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/account", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["tier"] == "Free"
    assert "billing" in data


# Notes: Ensure deleting the account removes authentication
def test_delete_account(client, db_session):
    """Account deletion should revoke access to protected endpoints."""
    _, token = register_and_login(db_session)

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.delete("/account/delete", headers=headers)
    assert resp.status_code == 204

    # Notes: Subsequent requests with the same token should fail
    resp_check = client.get("/account", headers=headers)
    assert resp_check.status_code == 401
