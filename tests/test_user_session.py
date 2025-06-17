import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

# Ensure project root is importable and environment variables are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
# Notes: increase rate limit during tests to avoid hitting global 100/minute cap
os.environ.setdefault("RATE_LIMIT", "100000/minute")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str, str]:
    """Create a new user and return id, email and auth token."""
    email = f"session_{uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, email, token


def test_session_create_and_end():
    """Verify a session record is created on login and closed on logout."""
    user_id, email, _ = register_user()

    # Notes: Perform login using form fields
    login_resp = client.post(
        "/auth/login",
        data={"username": email, "password": "password123"},
        headers={"User-Agent": "test-agent"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Notes: Logout immediately to close the session
    logout_resp = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 200

    # Notes: Query sessions using an admin account
    _, _, admin_token = register_user(role="admin")
    sessions_resp = client.get(
        "/admin/user-sessions",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert sessions_resp.status_code == 200
    sessions = sessions_resp.json()
    assert any(s["user_id"] == user_id for s in sessions)
    # Notes: Validate the session has an end timestamp and duration set
    matching = [s for s in sessions if s["user_id"] == user_id][0]
    assert matching["session_end"] is not None
    assert matching["total_duration"] is not None
