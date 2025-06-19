"""Service helpers for recording final agent failures."""

# Notes: Provide type hint for database session
from sqlalchemy.orm import Session

# Notes: Import the ORM model for stored failure logs
from models.agent_failure_log import AgentFailureLog


def log_final_failure(
    db: Session, user_id: int, agent_name: str, reason: str
) -> AgentFailureLog:
    """Persist a row describing the failure reason."""

    # Notes: Instantiate the log record with provided details
    entry = AgentFailureLog(
        user_id=user_id,
        agent_name=agent_name,
        reason=reason,
    )
    # Notes: Commit the entry to the database
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_failures(db: Session, limit: int = 50, offset: int = 0) -> list[AgentFailureLog]:
    """Return recent agent failure logs for admin dashboards."""

    # Notes: Query ordered by newest first with pagination
    entries = (
        db.query(AgentFailureLog)
        .order_by(AgentFailureLog.failed_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return entries

# Footnote: Future revision may notify administrators when logged.
