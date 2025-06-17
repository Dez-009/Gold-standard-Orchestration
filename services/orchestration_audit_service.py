"""Service for persisting and retrieving orchestration audit logs."""

# Notes: Import SQLAlchemy session type for DB interaction
from sqlalchemy.orm import Session
import json

# Notes: Import the ORM model representing orchestration entries
from models.orchestration_log import OrchestrationLog


def log_orchestration_request(
    db: Session,
    user_id: int,
    user_prompt: str,
    agents_invoked: list[str],
    full_response: list[dict],
) -> OrchestrationLog:
    """Create and persist an orchestration log entry."""

    # Notes: Convert complex structures to JSON strings before storage
    agents_json = json.dumps(agents_invoked)
    response_json = json.dumps(full_response)

    # Notes: Create the ORM object and commit to the database
    log_entry = OrchestrationLog(
        user_id=user_id,
        user_prompt=user_prompt,
        agents_invoked=agents_json,
        full_response=response_json,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def get_recent_orchestration_logs(
    db: Session,
    limit: int = 100,
    offset: int = 0,
) -> list[OrchestrationLog]:
    """Return recent orchestration logs ordered by newest first."""

    # Notes: Query table applying ordering and pagination
    return (
        db.query(OrchestrationLog)
        .order_by(OrchestrationLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

