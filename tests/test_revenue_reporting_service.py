"""Unit tests for the revenue reporting service."""

# Notes: Configure import paths and env vars for isolated testing
import os
import sys
from uuid import uuid4
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal, engine
from database.base import Base
from models.user import User
from models.subscription import Subscription
import services.revenue_reporting_service as reporting_service


def setup_user(db: Session) -> User:
    """Create and return a test user."""
    user = User(
        email=f"rep_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_generate_revenue_report():
    """Service should calculate extended revenue metrics."""
    # Notes: Prepare fresh database schema for the test case
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    u1 = setup_user(db)
    u2 = setup_user(db)
    u3 = setup_user(db)
    db.add_all([
        Subscription(user_id=u1.id, stripe_subscription_id=f"sub_{uuid4().hex}", status="active"),
        Subscription(user_id=u2.id, stripe_subscription_id=f"sub_{uuid4().hex}", status="active"),
        Subscription(user_id=u3.id, stripe_subscription_id=f"sub_{uuid4().hex}", status="canceled"),
    ])
    db.commit()

    now = datetime.utcnow().replace(day=1)
    last_month = (now - timedelta(days=1)).replace(day=1)
    events = [
        {"id": "e1", "event_type": "payment_intent.succeeded", "created_at": f"{last_month.strftime('%Y-%m')}-01T00:00:00Z"},
        {"id": "e2", "event_type": "payment_intent.succeeded", "created_at": f"{now.strftime('%Y-%m')}-01T00:00:00Z"},
    ]

    def _fake_events():
        return events

    monkeypatch = None
    try:
        import pytest
        monkeypatch = pytest.MonkeyPatch()
        monkeypatch.setattr(reporting_service, "get_recent_webhook_events", _fake_events)
        data = reporting_service.generate_revenue_report(db)
    finally:
        if monkeypatch:
            monkeypatch.undo()
        db.close()

    assert data["active_subscribers"] == 2
    assert data["churned_subscribers"] == 1
    assert data["mrr"] == 2 * reporting_service.CURRENT_PLAN_PRICE
    assert data["arr"] == 2 * reporting_service.CURRENT_PLAN_PRICE * 12
    assert data["arpu"] > 0
    assert "revenue_growth" in data
