"""Unit tests for the new notification service functions."""

import os
import sys
from uuid import uuid4

from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal
from models.user import User
from services.notification_service import create_notification, send_notification


def setup_user(db: Session) -> User:
    """Helper to insert a user for testing."""
    user = User(
        email=f"notify_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_create_and_send_notification():
    """Notification should be created and marked as sent."""
    db = SessionLocal()
    user = setup_user(db)

    notif = create_notification(db, user.id, "email", "hi")
    assert notif.status == "pending"
    assert notif.id is not None

    sent = send_notification(db, notif.id)
    assert sent is not None
    assert sent.status == "sent"
    assert sent.sent_at is not None
    db.close()
