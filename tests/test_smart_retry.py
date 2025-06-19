"""Unit tests for the smart retry logic in agent_runner."""

import os
import sys
import asyncio
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
from services.agent_runner import run_with_retry
from services.user_service import create_user
from models.orchestration_log import OrchestrationPerformanceLog
from tests.conftest import TestingSessionLocal, engine
from database.base import Base


def setup_db():
    """Initialize a fresh in-memory database."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def test_retry_succeeds_after_transient_error(monkeypatch):
    """Agent runner should retry once then succeed."""
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"rt_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )

    attempts = {"count": 0}

    async def call():
        attempts["count"] += 1
        if attempts["count"] == 1:
            raise asyncio.TimeoutError()
        return "ok"

    real_sleep = asyncio.sleep
    monkeypatch.setattr(asyncio, "sleep", lambda *_: real_sleep(0))

    result = asyncio.run(run_with_retry(db, user.id, "TestAgent", call))
    assert result == "ok"
    logs = db.query(OrchestrationPerformanceLog).all()
    assert len(logs) == 1
    assert logs[0].retries == 1
    db.close()

