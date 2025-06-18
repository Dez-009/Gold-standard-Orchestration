from datetime import datetime
from sqlalchemy.orm import Session
from uuid import UUID

from models.audit_log import AuditLog


def log_event(
    db: Session,
    summary_id: str | UUID,
    event_type: str,
    metadata: dict,
) -> AuditLog:
    """Persist an audit event tied to a journal summary."""

    # Normalize summary id as string for storage
    sid = str(summary_id)

    log_data = {
        "user_id": metadata.get("user_id"),
        "action": event_type,
        "detail": None,
        "summary_id": sid,
        "event_type": event_type,
        "metadata_json": metadata,
        "timestamp": datetime.utcnow(),
    }
    return create_audit_log(db, log_data)


def create_audit_log(db: Session, log_data: dict) -> AuditLog:
    """Create a new audit log entry and persist it."""
    # Initialize the ORM object and persist it to the database
    new_log = AuditLog(**log_data)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


def get_summary_audit_trail(db: Session, summary_id: str | UUID) -> list[AuditLog]:
    """Return audit events linked to a specific summary."""

    sid = str(summary_id)
    return (
        db.query(AuditLog)
        .filter(AuditLog.summary_id == sid)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )


def get_audit_logs_by_user(db: Session, user_id: int) -> list[AuditLog]:
    """Return all audit logs for a specific user."""
    # Retrieve audit log entries filtered by user
    return db.query(AuditLog).filter(AuditLog.user_id == user_id).all()


def get_all_audit_logs(db: Session) -> list[AuditLog]:
    """Return all audit log entries."""
    # Fetch every audit log entry in the database
    return db.query(AuditLog).all()


def get_recent_audit_logs(db: Session, limit: int = 100, offset: int = 0) -> list[AuditLog]:
    """Return audit logs ordered by timestamp DESC with pagination."""
    # Notes: Query the AuditLog table applying order and pagination
    return (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_audit_logs(db: Session, filters: dict) -> list[AuditLog]:
    """Return audit logs filtered by user, agent and date range."""

    # Notes: Start building the base query
    query = db.query(AuditLog)

    # Notes: Filter by user id when provided
    user_id = filters.get("user_id")
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)

    # Notes: Filter by agent name substring match within detail field
    agent_name = filters.get("agent_name")
    if agent_name:
        query = query.filter(AuditLog.detail.contains(agent_name))

    # Notes: Filter by start and end timestamps when provided
    start = filters.get("start_date")
    if start:
        query = query.filter(AuditLog.timestamp >= datetime.fromisoformat(start))

    end = filters.get("end_date")
    if end:
        query = query.filter(AuditLog.timestamp <= datetime.fromisoformat(end))

    # Notes: Apply ordering and pagination
    limit = filters.get("limit", 100)
    offset = filters.get("offset", 0)
    query = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit)

    # Notes: Execute the query and return results
    return query.all()
