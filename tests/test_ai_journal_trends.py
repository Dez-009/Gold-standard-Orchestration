"""Unit tests for the analyze_journal_trends function."""

# Notes: Ensure project modules can be imported and env vars are set
import os
import sys
from uuid import uuid4
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from sqlalchemy.orm import Session

from database.session import engine, SessionLocal
from database.base import Base
from models.user import User
from models.journal_trends import JournalTrend
from services import user_service, journal_service
from services.ai_processor import analyze_journal_trends, _parse_trend_response


# Notes: Helper to create a new user for testing
def setup_user(db: Session) -> User:
    user = user_service.create_user(
        db,
        {
            "email": f"jt_{uuid4().hex}@example.com",
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    return user


# Notes: Validate parsing utility handles well-formed JSON
def test_parse_trend_response():
    sample = (
        '{"mood_summary": "good", "keyword_trends": {"work": 2}, '
        '"goal_progress_notes": "on track"}'
    )
    data = _parse_trend_response(sample)
    assert data["mood_summary"] == "good"
    assert data["keyword_trends"]["work"] == 2


# Notes: Ensure analyze_journal_trends persists a record and returns data
def test_analyze_journal_trends_creates_record(monkeypatch):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    user = setup_user(db)
    journal_service.create_journal_entry(db, {"user_id": user.id, "content": "entry"})

    response_text = (
        '{"mood_summary": "ok", "keyword_trends": {"entry": 1}, '
        '"goal_progress_notes": "progress"}'
    )

    class FakeResp:
        def __init__(self, content: str):
            self.choices = [type("obj", (), {"message": type("obj", (), {"content": content})})]

    def fake_create(**_kwargs):
        return FakeResp(response_text)

    monkeypatch.setattr(
        "services.ai_processor.client.chat.completions.create", fake_create
    )

    result = analyze_journal_trends(db, user.id)
    assert isinstance(result, dict)
    records = db.query(JournalTrend).filter_by(user_id=user.id).all()
    assert len(records) == 1
    db.close()


# Notes: Verify OpenAI API is invoked with the expected model name
@pytest.mark.skipif(os.getenv("CI") == "true", reason="CI environment missing keys")
def test_analyze_journal_trends_calls_openai(monkeypatch):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    user = setup_user(db)
    journal_service.create_journal_entry(db, {"user_id": user.id, "content": "entry"})

    called: dict = {}

    class FakeResp:
        def __init__(self, content: str):
            self.choices = [type("obj", (), {"message": type("obj", (), {"content": content})})]

    def fake_create(**kwargs):
        called["model"] = kwargs.get("model")
        return FakeResp(
            '{"mood_summary": "ok", "keyword_trends": {}, "goal_progress_notes": ""}'
        )

    monkeypatch.setattr(
        "services.ai_processor.client.chat.completions.create", fake_create
    )

    analyze_journal_trends(db, user.id)
    assert called.get("model") == "gpt-4o"
    db.close()
