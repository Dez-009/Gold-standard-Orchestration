import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Ensure modules in parent directory are importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

# Notes: Use TestClient to issue requests to the FastAPI app
client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user with the given role and return id and token."""
    email = f"audit_{uuid.uuid4().hex}@example.com"
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


def create_sample_logs(user_id: int, token: str) -> None:
    """Create two audit logs for the given user via the API."""
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(2):
        data = {"user_id": user_id, "action": f"event_{i}", "detail": "details"}
        resp = client.post("/audit-logs/", json=data, headers=headers)
        assert resp.status_code == 200


def test_admin_access_required():
    """Non-admin users should receive 403 when listing audit logs."""
    _, token = register_user()
    resp = client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_admin_can_list_logs():
    """Admin endpoint should return recently created logs."""
    user_id, user_token = register_user()
    create_sample_logs(user_id, user_token)

    _, admin_token = register_user(role="admin")
    resp = client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2

