"""Tests for the subscription sync background service."""

import os
import sys
import uuid
import time
from fastapi.testclient import TestClient

# Notes: Ensure the application can be imported and environment variables exist
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test")

from main import app
from auth.auth_utils import create_access_token
from database.session import SessionLocal
from models.user import User
from models.subscription import Subscription
import services.billing_service as billing_service

client = TestClient(app)


def register_and_login(role: str = "user") -> tuple[int, str]:
    """Create a user and return its id with an auth token."""
    email = f"sync_{uuid.uuid4().hex}@example.com"
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


def create_subscription(user_id: int, sub_id: str | None = None) -> Subscription:
    """Helper to insert a subscription record for tests."""
    db = SessionLocal()
    if sub_id is None:
        sub_id = f"sub_{uuid.uuid4().hex}"
    sub = Subscription(user_id=user_id, stripe_subscription_id=sub_id, status="trialing")
    db.add(sub)
    db.commit()
    db.refresh(sub)
    db.close()
    return sub


def test_sync_route_requires_admin(monkeypatch):
    """Non-admin users should be forbidden from triggering the sync."""
    user_id, token = register_and_login()
    create_subscription(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/admin/system/sync_subscriptions", headers=headers)
    assert resp.status_code == 403


def test_sync_updates_subscription(monkeypatch):
    """Admin route should sync subscription data using Stripe API."""
    user_id, token = register_and_login(role="admin")
    sub = create_subscription(user_id)

    def fake_get(_sub_id: str):
        return {
            "id": _sub_id,
            "status": "active",
            "cancel_at": None,
            "current_period_end": int(time.time()) + 3600,
        }

    import services.billing_sync_service as sync_service
    monkeypatch.setattr(sync_service, "get_subscription_from_stripe", fake_get)

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/admin/system/sync_subscriptions", headers=headers)
    assert resp.status_code == 200

    db = SessionLocal()
    updated = db.query(Subscription).filter_by(id=sub.id).first()
    assert updated.status == "active"
    assert updated.current_period_end is not None
    db.close()
