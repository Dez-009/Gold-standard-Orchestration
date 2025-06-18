"""Service functions for persisting agent timeout records."""

# Notes: SQLAlchemy session typing
from sqlalchemy.orm import Session

# Notes: ORM model capturing timeout events
from models.agent_timeout_log import AgentTimeoutLog


def log_timeout(db: Session, user_id: int, agent_name: str) -> AgentTimeoutLog:
    """Create a timeout log entry for analytics."""

    # Notes: Instantiate the ORM row with provided details
    entry = AgentTimeoutLog(user_id=user_id, agent_name=agent_name)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_recent_timeouts(db: Session, limit: int = 100) -> list[AgentTimeoutLog]:
    """Return recent timeout events ordered by newest first."""

    # Notes: Query limited set ordered by timestamp descending
    return (
        db.query(AgentTimeoutLog)
        .order_by(AgentTimeoutLog.timestamp.desc())
        .limit(limit)
        .all()
    )

# Footnote: Use these helpers for future admin analytics.
