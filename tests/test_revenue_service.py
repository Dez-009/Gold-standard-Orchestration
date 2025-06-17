"""Unit tests for the revenue aggregation service."""

# Notes: Configure sys.path and environment so the app modules are importable

import os
import sys
from uuid import uuid4
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal, engine
from database.base import Base
from models.user import User
from models.subscription import Subscription
import services.revenue_service as revenue_service


def setup_user(db: Session) -> User:
    """Create and return a test user."""
    user = User(
        email=f"rev_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_get_revenue_summary():
    """Service should compute revenue metrics from data."""
    # Notes: Reset database schema for an isolated test environment
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    u1 = setup_user(db)
    u2 = setup_user(db)
    db.add_all([
        Subscription(user_id=u1.id, stripe_subscription_id=f"sub_{uuid4().hex}", status="active"),
        Subscription(user_id=u2.id, stripe_subscription_id=f"sub_{uuid4().hex}", status="canceled"),
    ])
    db.commit()

    fake_events = [
        {"id": "evt1", "event_type": "payment_intent.succeeded", "created_at": "2023-01-01"},
        {"id": "evt2", "event_type": "invoice.payment_failed", "created_at": "2023-01-02"},
    ]

    # Notes: Patch webhook retrieval to use predictable data
    def _fake_events():
        return fake_events

    monkeypatch = None
    try:
        import pytest
        monkeypatch = pytest.MonkeyPatch()
        monkeypatch.setattr(revenue_service, "get_recent_webhook_events", _fake_events)
        data = revenue_service.get_revenue_summary(db)
    finally:
        if monkeypatch:
            monkeypatch.undo()
        db.close()

    assert data["active_subscriptions"] == 1
    assert data["mrr"] == revenue_service.CURRENT_PLAN_PRICE
    assert data["arr"] == revenue_service.CURRENT_PLAN_PRICE * 12
    assert data["lifetime_revenue"] == revenue_service.CURRENT_PLAN_PRICE
