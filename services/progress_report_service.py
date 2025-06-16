# Notes: Service providing AI-based progress summaries for a user
from __future__ import annotations

# Notes: Standard library imports for typing and logging
from typing import List
from uuid import UUID

# Notes: SQLAlchemy session type for database operations
from sqlalchemy.orm import Session

# Notes: ORM models used to gather historical data
from models.session import Session as SessionModel
from models.daily_checkin import DailyCheckIn

# Notes: Audit log service to record report generation events
from services.audit_log_service import create_audit_log


# Notes: Placeholder function that would send data to an AI model
# In a real implementation this would call OpenAI or another provider
# and return a synthesized progress summary for the user
def _call_ai_model(sessions: List[SessionModel], checkins: List[DailyCheckIn]) -> str:
    """Return a simple text summary describing counts of records."""
    return (
        f"You completed {len(sessions)} sessions and "
        f"submitted {len(checkins)} check-ins. Keep up the great work!"
    )


# Notes: Generate a progress report for the given user id
# The function loads historical sessions and check-ins, calls the AI model
# to analyze them, logs the creation, and returns the summary text
def generate_progress_report(db: Session, user_id: UUID) -> str:
    """Return an AI-generated progress report for the user."""

    # Notes: Query all sessions belonging to the user
    sessions = db.query(SessionModel).filter(SessionModel.user_id == user_id).all()

    # Notes: Query all daily check-ins for the user
    checkins = db.query(DailyCheckIn).filter(DailyCheckIn.user_id == user_id).all()

    # Notes: Invoke the AI model (currently stubbed) to analyze the data
    report_text = _call_ai_model(sessions, checkins)

    # Notes: Record the creation of this report in the audit log
    create_audit_log(
        db,
        {"user_id": user_id, "action": "progress_report_generated", "detail": None},
    )

    # Notes: Return the text-based report back to the caller
    return report_text
