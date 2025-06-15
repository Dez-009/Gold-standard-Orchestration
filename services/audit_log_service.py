from sqlalchemy.orm import Session

from models.audit_log import AuditLog


def create_audit_log(db: Session, log_data: dict) -> AuditLog:
    """Create a new audit log entry and persist it."""
    new_log = AuditLog(**log_data)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


def get_audit_logs_by_user(db: Session, user_id: int) -> list[AuditLog]:
    """Return all audit logs for a specific user."""
    return db.query(AuditLog).filter(AuditLog.user_id == user_id).all()


def get_all_audit_logs(db: Session) -> list[AuditLog]:
    """Return all audit log entries."""
    return db.query(AuditLog).all()
