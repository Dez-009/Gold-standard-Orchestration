import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.orchestration_log_service import log_agent_run, fetch_logs
from services.user_service import create_user
from models.orchestration_log import OrchestrationPerformanceLog
from tests.conftest import TestingSessionLocal


def test_log_agent_run_persists():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "perf@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log_agent_run(
        db,
        "JournalSummarizationAgent",
        user.id,
        {
            "execution_time_ms": 123,
            "input_tokens": 50,
            "output_tokens": 10,
            "status": "success",
            "fallback_triggered": False,
        },
    )
    logs = db.query(OrchestrationPerformanceLog).all()
    assert len(logs) == 1
    assert logs[0].agent_name == "JournalSummarizationAgent"
    db.close()


def test_fetch_logs_pagination():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "perf2@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    for _ in range(10):
        log_agent_run(
            db,
            "JournalSummarizationAgent",
            user.id,
            {
                "execution_time_ms": 10,
                "input_tokens": 1,
                "output_tokens": 1,
                "status": "success",
                "fallback_triggered": False,
            },
        )
    subset = fetch_logs(db, skip=5, limit=3)
    assert len(subset) == 3
    db.close()
