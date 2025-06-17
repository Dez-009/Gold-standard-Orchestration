from sqlalchemy.orm import Session

from models.audit_log import AuditLog


def create_audit_log(db: Session, log_data: dict) -> AuditLog:
    """Create a new audit log entry and persist it."""
    # Initialize the ORM object and persist it to the database
    new_log = AuditLog(**log_data)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


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
