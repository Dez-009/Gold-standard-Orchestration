"""Admin endpoints for viewing audit logs."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from models.audit_log import AuditLog
from services import audit_log_service


# Notes: Router prefix groups all admin audit endpoints under /admin/audit
router = APIRouter(prefix="/admin/audit", tags=["admin"])


@router.get("/logs")
def list_audit_logs(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
) -> list[dict]:
    """Return audit log entries with related user email and filtering options."""
    
    # Build query with user relationship loaded
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    
    # Apply filters
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    
    if action:
        query = query.filter(AuditLog.action.contains(action))
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(AuditLog.timestamp >= start_dt)
        except ValueError:
            pass  # Ignore invalid date format
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(AuditLog.timestamp <= end_dt)
        except ValueError:
            pass  # Ignore invalid date format
    
    # Apply ordering and pagination
    logs = query.order_by(desc(AuditLog.timestamp)).offset(offset).limit(limit).all()
    
    # Convert to response format
    results: list[dict] = []
    for log in logs:
        results.append(
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "user_email": log.user.email if log.user else None,
                "user_id": log.user_id,
                "action": log.action,
                "detail": log.detail,
                "event_type": log.event_type,
                "summary_id": log.summary_id,
                "metadata": log.metadata_json,
            }
        )
    return results


@router.get("/stats")
def get_audit_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return audit log statistics for the admin dashboard."""
    
    # Get total count
    total_count = db.query(AuditLog).count()
    
    # Get count by action type
    action_counts = db.query(
        AuditLog.action, 
        db.func.count(AuditLog.id).label('count')
    ).group_by(AuditLog.action).all()
    
    # Get recent activity (last 24 hours)
    yesterday = datetime.utcnow() - datetime.timedelta(days=1)
    recent_count = db.query(AuditLog).filter(AuditLog.timestamp >= yesterday).count()
    
    return {
        "total_logs": total_count,
        "recent_logs_24h": recent_count,
        "action_breakdown": [
            {"action": action, "count": count} 
            for action, count in action_counts
        ]
    }

