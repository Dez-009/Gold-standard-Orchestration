import os
import sys
import asyncio
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ.setdefault("OPENAI_API_KEY", "test")

from orchestration.executor import execute_agent
from services.user_service import create_user
from tests.conftest import TestingSessionLocal
import orchestration.executor as executor
from database.base import Base
from tests.conftest import engine


def test_execute_agent_retry_success(monkeypatch):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"exec_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )

    attempts = {"count": 0}

    async def call():
        attempts["count"] += 1
        if attempts["count"] == 1:
            # Notes: First invocation simulates a timeout error
            raise asyncio.TimeoutError()
        return "ok"

    monkeypatch.setattr(executor, "AGENT_TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr(executor, "AGENT_MAX_RETRIES", 2)
    real_sleep = asyncio.sleep
    monkeypatch.setattr(executor.asyncio, "sleep", lambda *_: real_sleep(0))

    result = asyncio.run(execute_agent(db, "TestAgent", user.id, call))
    # Notes: Should return final text along with retry metadata
    assert result.text == "ok"
    assert result.retry_count == 1
    assert result.timeout_occurred is True
    db.close()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_execute_agent_retry_failure(monkeypatch):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"exec_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )

    async def call():
        # Notes: Always timeout then raise an error to force retry
        await asyncio.sleep(0)
        raise asyncio.TimeoutError()

    monkeypatch.setattr(executor, "AGENT_TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr(executor, "AGENT_MAX_RETRIES", 1)
    real_sleep = asyncio.sleep
    monkeypatch.setattr(executor.asyncio, "sleep", lambda *_: real_sleep(0))

    result = asyncio.run(execute_agent(db, "TestAgent", user.id, call))
    # Notes: Expect empty text after retries exhausted
    assert result.text == ""
    assert result.retry_count == 1
    assert result.timeout_occurred is True
    db.close()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
