"""Tests for conversation memory context builder."""

# Notes: Standard library imports for setup
import os
import sys
from uuid import uuid4

# Notes: Ensure project modules can be imported and env vars set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import Session factory and base for setting up a temporary DB
from database.session import SessionLocal, engine
from database.base import Base

# Notes: Import services and models needed to populate records
from services.conversation_memory_service import build_memory_context, MAX_MEMORY_TOKENS
from services import user_service, journal_service, goal_service, session_service, task_service


def setup_db():
    """Create a fresh in-memory database and return a session."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


def create_user(db):
    """Helper to add a user for the tests."""
    user = user_service.create_user(
        db,
        {
            "email": f"mem_{uuid4().hex}@example.com",
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    return user.id


def test_full_memory_context():
    """Verify memory context includes sessions, journals, goals and tasks."""
    db = setup_db()
    user_id = create_user(db)

    # Notes: Create a couple of sessions with summaries
    session_service.create_session(
        db,
        {"user_id": user_id, "ai_summary": "Talked about career"},
    )
    session_service.create_session(
        db,
        {"user_id": user_id, "ai_summary": "Discussed health"},
    )

    # Notes: Add some journal entries for the user
    journal_service.create_journal_entry(
        db,
        {"user_id": user_id, "content": "First journal"},
    )
    journal_service.create_journal_entry(
        db,
        {"user_id": user_id, "content": "Second journal"},
    )

    # Notes: Insert active goals and tasks
    goal_service.create_goal(db, {"user_id": user_id, "title": "Goal 1"})
    task_service.create_task(db, {"user_id": user_id, "description": "Task A"})

    # Notes: Build the memory context and assert fragments are present
    context = build_memory_context(db, user_id, ["career"], "Hello")
    assert "Previous Sessions:" in context
    assert "Talked about career" in context
    assert "Journal Entries:" in context
    assert "First journal" in context
    assert "Active Goals:" in context
    assert "Goal 1" in context
    assert "Active Tasks:" in context
    assert "Task A" in context
    db.close()


def test_empty_memory_sources():
    """Empty history should yield an empty context string."""
    db = setup_db()
    user_id = create_user(db)
    context = build_memory_context(db, user_id, None, "Hi")
    assert context == ""
    db.close()


def test_token_truncation(monkeypatch):
    """Ensure content is truncated when exceeding the max token limit."""
    db = setup_db()
    user_id = create_user(db)

    # Notes: Create a very long journal entry exceeding the limit
    long_text = "word " * 50
    journal_service.create_journal_entry(db, {"user_id": user_id, "content": long_text})

    # Notes: Patch the constant so the limit is small for the test
    monkeypatch.setattr(
        "services.conversation_memory_service.MAX_MEMORY_TOKENS", 10, raising=False
    )

    context = build_memory_context(db, user_id, None, "hi")
    # Notes: Result should contain at most 10 tokens
    assert len(context.split()) <= 10
    db.close()
