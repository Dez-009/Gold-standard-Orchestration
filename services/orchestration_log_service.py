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
        # Notes: Persist whether the run exceeded the timeout threshold
        timeout_occurred=metrics.get("timeout_occurred", False),
        # Notes: Record how many retries were attempted
        retries=metrics.get("retries", 0),
        # Notes: Persist the final error message if any
        error_message=metrics.get("error_message"),
        # Notes: Persist which prompt version the agent used
        prompt_version=metrics.get("prompt_version"),
        # Notes: Capture whether the run was manually overridden by an admin
        override_triggered=metrics.get("override_triggered", False),
        # Notes: Persist any reason provided for the override
        override_reason=metrics.get("override_reason"),
        # Notes: Flag if auto moderation was triggered
        moderation_triggered=metrics.get("moderation_triggered", False),
        # Notes: Type of trigger that caused the moderation event
        trigger_type=metrics.get("trigger_type"),
    )
    # Notes: Commit the new record to the database
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def fetch_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    override: bool | None = None,
) -> list[OrchestrationPerformanceLog]:
    """Return a slice of orchestration performance logs.

    When ``override`` is provided, results are filtered to only
    logs where ``override_triggered`` matches the boolean value.
    """

    # Notes: Begin building the base query ordered by newest first
    query = db.query(OrchestrationPerformanceLog).order_by(
        OrchestrationPerformanceLog.timestamp.desc()
    )

    # Notes: Apply override filter when requested
    if override is not None:
        query = query.filter(OrchestrationPerformanceLog.override_triggered == override)

    # Notes: Apply pagination limits
    return query.offset(skip).limit(limit).all()


def get_override_history(
    db: Session, user_id: int, agent_name: str
) -> list[OrchestrationPerformanceLog]:
    """Return all override logs for a user and specific agent."""

    # Notes: Query logs matching user, agent and the override flag
    return (
        db.query(OrchestrationPerformanceLog)
        .filter(
            OrchestrationPerformanceLog.user_id == user_id,
            OrchestrationPerformanceLog.agent_name == agent_name,
            OrchestrationPerformanceLog.override_triggered.is_(True),
        )
        .order_by(OrchestrationPerformanceLog.timestamp.desc())
        .all()
    )

# Footnote: Provides simple create and read operations for orchestration metrics.


def filter_logs(db: Session, filters: dict) -> list[OrchestrationPerformanceLog]:
    """Return logs filtered by the provided criteria."""

    query = db.query(OrchestrationPerformanceLog).order_by(
        OrchestrationPerformanceLog.timestamp.desc()
    )

    # Notes: Allow filtering by agent name for future agent additions
    if agent := filters.get("agent_name"):
        query = query.filter(OrchestrationPerformanceLog.agent_name == agent)

    if status := filters.get("status"):
        query = query.filter(OrchestrationPerformanceLog.status == status)

    # Notes: Filter runs that used fallback handling
    if (fallback := filters.get("fallback_used")) is not None:
        query = query.filter(OrchestrationPerformanceLog.fallback_triggered == fallback)

    # Notes: Only return logs flagged by moderation when requested
    if filters.get("flagged_only"):
        query = query.filter(OrchestrationPerformanceLog.moderation_triggered.is_(True))

    if date_range := filters.get("date_range"):
        try:
            start, end = [d.strip() for d in date_range.split(",", 1)]
            query = query.filter(
                OrchestrationPerformanceLog.timestamp >= start,
                OrchestrationPerformanceLog.timestamp <= end,
            )
        except ValueError:
            # Notes: Ignore malformed date ranges
            pass

    if limit := filters.get("limit"):
        query = query.limit(int(limit))
    if offset := filters.get("skip"):
        query = query.offset(int(offset))

    return query.all()


def export_logs_to_csv(db: Session, filters: dict) -> str:
    """Serialize filtered logs to CSV for download."""

    logs = filter_logs(db, filters)

    import csv
    from io import StringIO

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(
        [
            "id",
            "agent_name",
            "user_id",
            "execution_time_ms",
            "input_tokens",
            "output_tokens",
            "status",
            "fallback_triggered",
            "timestamp",
        ]
    )

    for log in logs:
        writer.writerow(
            [
                str(log.id),
                log.agent_name,
                log.user_id,
                log.execution_time_ms,
                log.input_tokens,
                log.output_tokens,
                log.status,
                log.fallback_triggered,
                log.timestamp.isoformat(),
            ]
        )

    return output.getvalue()
