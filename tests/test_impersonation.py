import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token, verify_access_token
from database.session import SessionLocal
from models.user import User

client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str]:
    """Helper to create a user and return id plus auth token."""
    email = f"imp_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_list_requires_admin():
    """Regular users should not access the impersonation list."""
    _, token = register_user()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/admin/impersonation/users", headers=headers)
    assert resp.status_code == 403


def test_admin_can_list_users():
    """Admin users should receive the list of users."""
    user_id, _ = register_user()
    _, admin_token = register_user(role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.get("/admin/impersonation/users", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(u["id"] == user_id for u in data)


def test_create_impersonation_token():
    """Admin should obtain a token for another user."""
    target_id, _ = register_user()
    _, admin_token = register_user(role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.post(
        "/admin/impersonation/token",
        json={"user_id": target_id},
        headers=headers,
    )
    assert resp.status_code == 200
    token = resp.json()["token"]
    payload = verify_access_token(token)
    assert payload["user_id"] == target_id
