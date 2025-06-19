"""Unit tests for the progress report service."""

# Notes: Ensure imports work by adjusting path and environment
import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from sqlalchemy.orm import Session

from database.session import engine, SessionLocal
from database.base import Base
from models.user import User
from models.audit_log import AuditLog
from models.daily_checkin import Mood
from services import (
    user_service,
    session_service,
    daily_checkin_service,
    progress_report_service,
)


def setup_user(db: Session) -> User:
    """Create and return a user for testing."""
    user = user_service.create_user(
        db,
        {
            "email": f"progress_{uuid4().hex}@example.com",
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    return user


def test_generate_progress_report():
    """Service should return summary text and log an audit entry."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    user = setup_user(db)

    # Notes: Create a sample session and check-in for the user
    session_service.create_session(db, {"user_id": user.id, "title": "Test"})
    daily_checkin_service.create_checkin(db, user.id, Mood.GOOD, 5, 3, "notes")

    # Notes: Generate the progress report
    report = progress_report_service.generate_progress_report(db, user.id)
    assert isinstance(report, str)
    assert "check-ins" in report

    # Notes: Verify an audit log entry was created
    log_entries = db.query(AuditLog).filter_by(user_id=user.id).all()
    assert len(log_entries) == 1
    assert log_entries[0].action == "progress_report_generated"
    db.close()
