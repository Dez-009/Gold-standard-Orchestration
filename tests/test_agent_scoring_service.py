"""Tests for the agent scoring service and model."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.agent_scoring_service import score_agent_responses
from services import user_service
from models.agent_score import AgentScore
from tests.conftest import TestingSessionLocal


def test_scoring_structure():
    """Service should return scores keyed by agent."""
    user_id = uuid.uuid4()
    result = score_agent_responses(user_id, [("career", "some reply")])
    assert result["user_id"] == user_id
    assert "career" in result["scores"]
    metrics = result["scores"]["career"]
    assert set(metrics.keys()) == {
        "completeness_score",
        "clarity_score",
        "relevance_score",
    }


def test_model_insertion():
    """AgentScore ORM model should persist correctly."""
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": f"score_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    result = score_agent_responses(user.id, [("career", "a" * 50)])
    metrics = result["scores"]["career"]
    row = AgentScore(
        user_id=user.id,
        agent_name="career",
        completeness_score=metrics["completeness_score"],
        clarity_score=metrics["clarity_score"],
        relevance_score=metrics["relevance_score"],
    )
    db.add(row)
    db.commit()

    fetched = db.query(AgentScore).first()
    assert fetched.agent_name == "career"
    assert fetched.user_id == user.id
    db.close()

