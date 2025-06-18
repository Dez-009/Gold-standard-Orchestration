"""Unit tests for the global insights aggregation service."""

import os
import sys
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal, engine
from database.base import Base
from models.user import User
from models.journal_entry import JournalEntry
from models.agent_execution_log import AgentExecutionLog
from models.user_feedback import UserFeedback, FeedbackType
from models.daily_checkin import DailyCheckIn, Mood
from services.global_insights_service import get_global_insights


def setup_user(db: Session) -> User:
    user = User(
        email=f"gi_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pwd",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_get_global_insights():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    u1 = setup_user(db)
    u2 = setup_user(db)

    # Journals: one within 7d and one older
    db.add_all([
        JournalEntry(user_id=u1.id, content="a", created_at=datetime.utcnow()),
        JournalEntry(user_id=u2.id, content="b", created_at=datetime.utcnow() - timedelta(days=8)),
    ])

    # Agent executions
    db.add_all([
        AgentExecutionLog(user_id=u1.id, agent_name="A", input_prompt="x"),
        AgentExecutionLog(user_id=u1.id, agent_name="A", input_prompt="x"),
        AgentExecutionLog(user_id=u2.id, agent_name="B", input_prompt="x"),
    ])

    # Feedback entries
    db.add_all([
        UserFeedback(user_id=u1.id, feedback_type=FeedbackType.BUG, message="m"),
        UserFeedback(user_id=u2.id, feedback_type=FeedbackType.BUG, message="m"),
        UserFeedback(user_id=u2.id, feedback_type=FeedbackType.PRAISE, message="m"),
    ])

    # Mood checkins
    db.add_all([
        DailyCheckIn(user_id=u1.id, mood=Mood.GOOD, energy_level=5, stress_level=5),
        DailyCheckIn(user_id=u2.id, mood=Mood.OKAY, energy_level=5, stress_level=5),
    ])

    db.commit()

    data = get_global_insights(db)

    assert data["journals_last_7d"] == 1
    assert data["weekly_active_users"] == 1
    assert data["top_agent"] == "A"
    assert data["top_feedback_reason"] == "Bug"
    assert 3.0 <= data["avg_mood"] <= 4.5

    db.close()
