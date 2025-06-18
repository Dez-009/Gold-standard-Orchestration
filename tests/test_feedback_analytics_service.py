"""Unit tests for feedback analytics aggregation service."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import user_service, feedback_service
from services.agent_feedback_service import create_feedback
from services.feedback_alert_service import log_alert_if_low_rating
from services.feedback_analytics_service import get_feedback_summary
from models.user_feedback import FeedbackType
from models.journal_summary import JournalSummary
from models.agent_output_flag import AgentOutputFlag
from tests.conftest import TestingSessionLocal


def test_feedback_summary_aggregates():
    """Service should compute counts and averages."""
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": f"fa_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    # Create a summary row
    summary = JournalSummary(user_id=user.id, summary_text="x", source_entry_ids="[]")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    # User feedback entries
    feedback_service.submit_feedback(
        db,
        {"user_id": user.id, "feedback_type": FeedbackType.PRAISE, "message": "good"},
    )

    # Agent feedback reactions
    create_feedback(db, user.id, str(summary.id), "👍", None)
    create_feedback(db, user.id, str(summary.id), "👎", None)

    # Low rating alert created manually to test averaging
    from models.agent_feedback_alert import AgentFeedbackAlert
    alert = AgentFeedbackAlert(user_id=user.id, summary_id=summary.id, rating=4)
    db.add(alert)
    db.commit()

    # Flagged output
    flag = AgentOutputFlag(
        agent_name="JournalSummarizationAgent",
        user_id=user.id,
        summary_id=summary.id,
        reason="bad",
    )
    db.add(flag)
    db.commit()

    summary_data = get_feedback_summary(db)
    agent = summary_data["agents"]["JournalSummarizationAgent"]
    assert agent["likes"] == 1
    assert agent["dislikes"] == 1
    assert agent["flagged"] == 1
    assert agent["average_rating"] == 4.0
    assert summary_data["feedback_weekly"][0]["count"] >= 1
    db.close()
