"""Tests for the behavioral insights aggregation service."""

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
from models.daily_checkin import DailyCheckIn, Mood
from models.goal import Goal
from models.journal_entry import JournalEntry
from services.behavioral_insights_service import generate_behavioral_insights


def setup_user(db: Session) -> User:
    """Create and return a test user."""
    user = User(
        email=f"agg_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_generate_behavioral_insights():
    """Service should compute metrics and return a summary."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Notes: Create sample users and activity records
    u1 = setup_user(db)
    u2 = setup_user(db)

    db.add_all([
        DailyCheckIn(user_id=u1.id, mood=Mood.GOOD, energy_level=5, stress_level=5),
        DailyCheckIn(user_id=u1.id, mood=Mood.GOOD, energy_level=5, stress_level=5),
        DailyCheckIn(user_id=u1.id, mood=Mood.GOOD, energy_level=5, stress_level=5),
        DailyCheckIn(user_id=u2.id, mood=Mood.GOOD, energy_level=5, stress_level=5),
        Goal(user_id=u1.id, title="g", is_completed=True),
        JournalEntry(user_id=u1.id, content="note"),
        JournalEntry(user_id=u2.id, content="note"),
    ])
    db.commit()

    # Notes: Call the service under test
    data = generate_behavioral_insights(db)

    assert data["journal_entries"] == 2
    assert data["completed_goals"] >= 1
    assert data["top_active_users"][0]["user_id"] == u1.id
    assert data["avg_checkins_per_week"] > 0

    db.close()
