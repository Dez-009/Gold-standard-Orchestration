"""Unit tests for the system metrics service."""

import os
import sys
from uuid import uuid4

from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal
from models.user import User
from models.subscription import Subscription
from services.system_metrics_service import record_metric, get_recent_metrics


def setup_user(db: Session) -> User:
    """Create a user for metrics tests."""
    user = User(
        email=f"metric_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_record_metric():
    """record_metric should persist a metric value."""
    db = SessionLocal()
    metric = record_metric(db, "api_calls", 5)
    assert metric.id is not None
    assert metric.metric_value == 5
    db.close()


def test_get_recent_metrics_counts():
    """get_recent_metrics should include computed user and subscription totals."""
    db = SessionLocal()
    # Insert sample users
    u1 = setup_user(db)
    u2 = setup_user(db)
    # Add one active and one trialing subscription
    active = Subscription(
        user_id=u1.id,
        stripe_subscription_id=f"sub_{uuid4().hex}",
        status="active",
    )
    trial = Subscription(
        user_id=u2.id,
        stripe_subscription_id=f"sub_{uuid4().hex}",
        status="trialing",
    )
    db.add_all([active, trial])
    db.commit()

    record_metric(db, "ai_completions", 7)
    metrics = get_recent_metrics(db)
    assert metrics["total_users"] >= 2
    assert metrics["active_subscriptions"] >= 1
    assert metrics["ai_completions"] == 7
    db.close()
