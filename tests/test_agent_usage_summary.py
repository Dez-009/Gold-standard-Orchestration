import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.user_service import create_user
from services.orchestration_log_service import log_agent_run
from services.agent_analytics_service import get_user_agent_usage_summary
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def test_usage_summary_service():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"us_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    # two runs of first agent
    for _ in range(2):
        log_agent_run(
            db,
            "JournalSummarizationAgent",
            user.id,
            {
                "execution_time_ms": 1,
                "input_tokens": 50,
                "output_tokens": 10,
                "status": "success",
            },
        )
    # single run of second agent
    log_agent_run(
        db,
        "CareerAgent",
        user.id,
        {
            "execution_time_ms": 1,
            "input_tokens": 20,
            "output_tokens": 5,
            "status": "success",
        },
    )
    summary = get_user_agent_usage_summary(db, user.id)
    db.close()
    assert any(s["agent_name"] == "JournalSummarizationAgent" and s["runs"] == 2 for s in summary)
    assert any(s["agent_name"] == "CareerAgent" and s["runs"] == 1 for s in summary)


def test_usage_summary_endpoint():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"ue_{uuid.uuid4().hex}@example.com",
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
            "input_tokens": 20,
            "output_tokens": 5,
            "status": "success",
        },
    )
    admin = create_user(
        db,
        {
            "email": f"admin_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
            "role": "admin",
        },
    )
    user_id = user.id
    token = create_access_token({"user_id": admin.id})
    db.close()
    resp = client.get(
        f"/admin/agents/usage-summary/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert isinstance(payload, list)
    assert payload[0]["agent_name"] == "JournalSummarizationAgent"
