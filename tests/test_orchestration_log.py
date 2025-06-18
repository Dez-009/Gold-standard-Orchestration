import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.orchestration_log_service import log_agent_run, fetch_logs
from services.user_service import create_user
from services import orchestration_service
from models.orchestration_log import OrchestrationPerformanceLog
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal, engine
from database.base import Base


def test_log_agent_run_persists():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
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


def test_auto_flag_integration():
    """Auto flag should record moderation info in the log."""
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "perf3@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    summary = SummarizedJournal(user_id=user.id, summary_text="bad kill text")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    orchestration_service.handle_summary_moderation(db, summary)
    log = db.query(OrchestrationPerformanceLog).first()
    assert log.moderation_triggered is True
    assert log.trigger_type == "keyword"
