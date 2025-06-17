"""Service layer for orchestrator performance log entries."""

# Notes: Type hints for database sessions
from sqlalchemy.orm import Session

# Notes: Import the ORM model defined for performance metrics
from models.orchestration_log import OrchestrationPerformanceLog


def log_agent_run(
    db: Session,
    agent_name: str,
    user_id: int,
    metrics: dict,
) -> OrchestrationPerformanceLog:
    """Persist a performance log entry from an orchestration run."""

    # Notes: Instantiate and populate the ORM model
    log_entry = OrchestrationPerformanceLog(
        agent_name=agent_name,
        user_id=user_id,
        execution_time_ms=metrics.get("execution_time_ms"),
        input_tokens=metrics.get("input_tokens"),
        output_tokens=metrics.get("output_tokens"),
        status=metrics.get("status"),
        fallback_triggered=metrics.get("fallback_triggered", False),
    )
    # Notes: Commit the new record to the database
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def fetch_logs(db: Session, skip: int = 0, limit: int = 100) -> list[OrchestrationPerformanceLog]:
    """Return a slice of orchestration performance logs."""

    # Notes: Query ordered by newest first with pagination
    return (
        db.query(OrchestrationPerformanceLog)
        .order_by(OrchestrationPerformanceLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

# Footnote: Provides simple create and read operations for orchestration metrics.
