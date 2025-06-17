import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Ensure project root is importable and environment vars set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user and return id and token."""
    email = f"admin_insight_{uuid.uuid4().hex}@example.com"
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


def test_insights_requires_admin():
    """Endpoint should reject non-admin users."""
    _, token = register_user()
    resp = client.get(
        "/admin/behavioral-insights",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_admin_receives_insights(monkeypatch):
    """Admin request should return insight metrics."""
    _, admin_token = register_user(role="admin")

    # Notes: Patch service to return deterministic payload
    import routes.admin_insights as admin_route

    monkeypatch.setattr(
        admin_route, "generate_behavioral_insights", lambda *_: {"ok": True}
    )

    resp = client.get(
        "/admin/behavioral-insights",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data == {"ok": True}
