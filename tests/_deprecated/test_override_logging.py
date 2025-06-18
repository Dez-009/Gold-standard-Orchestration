import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.orchestration_log_service import log_agent_run, get_override_history
from services.user_service import create_user
from tests.conftest import TestingSessionLocal


def test_override_fields_persist():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "ovr@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log_agent_run(
        db,
        "JournalSummarizationAgent",
        user.id,
        {
            "execution_time_ms": 1,
            "input_tokens": 1,
            "output_tokens": 1,
            "status": "success",
            "fallback_triggered": False,
            "override_triggered": True,
            "override_reason": "bad output",
        },
    )
    history = get_override_history(db, user.id, "JournalSummarizationAgent")
    assert len(history) == 1
    assert history[0].override_reason == "bad output"
    db.close()
