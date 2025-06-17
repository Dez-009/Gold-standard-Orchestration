import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Ensure application modules can be imported in test environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.session import engine, SessionLocal
from database.base import Base

client = TestClient(app)


def setup_db():
    """Reset the in-memory database tables."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user and return id and token."""
    email = f"aa_{uuid.uuid4().hex}@example.com"
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


def create_events(token: str):
    """Create a few analytics events via the API."""
    headers = {"Authorization": f"Bearer {token}"}
    events = ["page_view", "click", "page_view"]
    for et in events:
        resp = client.post(
            "/analytics/event",
            json={"event_type": et, "event_payload": {"example": True}},
            headers=headers,
        )
        assert resp.status_code == 200


def test_requires_admin():
    """Non-admin users should be blocked from the summary."""
    setup_db()
    _, token = register_user()
    resp = client.get("/admin/analytics/summary", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_summary_counts():
    """Admin should receive aggregated event counts."""
    setup_db()
    user_id, user_token = register_user()
    create_events(user_token)
    _, admin_token = register_user(role="admin")
    resp = client.get(
        "/admin/analytics/summary",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_events"] == 3
    assert data["events_by_type"]["page_view"] == 2
    assert any(row["count"] >= 3 for row in data["events_daily"])
