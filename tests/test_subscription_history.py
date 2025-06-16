import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Ensure the app module is importable and environment variables exist
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.session import SessionLocal
from models.user import User
from models.subscription import Subscription

client = TestClient(app)


def register_and_login(role: str = "user") -> tuple[int, str]:
    """Create a user and return its id plus auth token."""
    email = f"hist_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    # Notes: Mirror the new user in the SessionLocal database for join queries
    db = SessionLocal()
    db_user = User(**user_data, id=user_id, is_active=True)
    db.add(db_user)
    db.commit()
    db.close()
    token = create_access_token({"user_id": user_id})
    return user_id, token


def create_subscription(user_id: int) -> Subscription:
    """Insert a subscription record for testing."""
    db = SessionLocal()
    sub = Subscription(
        user_id=user_id,
        stripe_subscription_id=f"sub_{uuid.uuid4().hex}",
        status="active",
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    db.close()
    return sub


def test_history_requires_admin():
    """Non-admin users should receive 403 when requesting history."""
    user_id, token = register_and_login()
    create_subscription(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/admin/subscriptions/history", headers=headers)
    assert resp.status_code == 403


def test_history_returns_records_for_admin():
    """Admin users should receive subscription history records."""
    user_id, token = register_and_login(role="admin")
    sub = create_subscription(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/admin/subscriptions/history", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(
        r["stripe_subscription_id"] == sub.stripe_subscription_id for r in data
    )
