"""Unit tests for the generate_journal_summary function."""

# Notes: Configure path and environment for importing the app modules
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
from models.journal_entry import JournalEntry
from models.journal_summary import JournalSummary
from services import user_service, journal_service
from services.ai_processor import generate_journal_summary


# Notes: Helper to create a test user
def setup_user(db: Session) -> User:
    user = user_service.create_user(
        db,
        {
            "email": f"js_{uuid4().hex}@example.com",
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    return user


# Notes: Validate that a summary record is created and text returned
def test_generate_journal_summary_creates_record():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    user = setup_user(db)

    # Notes: Create a sample journal entry for the user
    journal_service.create_journal_entry(db, {"user_id": user.id, "content": "note"})

    # Notes: Call the function under test
    summary_text = generate_journal_summary(db, user.id)
    assert isinstance(summary_text, str)

    # Notes: Ensure a JournalSummary row was persisted
    summaries = db.query(JournalSummary).filter_by(user_id=user.id).all()
    assert len(summaries) == 1
    db.close()
