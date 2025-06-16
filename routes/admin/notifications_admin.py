"""Admin routes for managing notification records."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import notification_service, audit_log_service
from models.notification import Notification
from models.user import User

router = APIRouter(prefix="/admin/notifications", tags=["admin"])


@router.get("/")
def list_notifications(
    ntype: str | None = None,
    status_filter: str | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return notifications optionally filtered by type and status."""
    query = db.query(Notification)
    if ntype:
        query = query.filter(Notification.type == ntype)
    if status_filter:
        query = query.filter(Notification.status == status_filter)
    records = query.all()
    result: list[dict] = []
    for n in records:
        result.append(
            {
                "id": n.id,
                "user_id": n.user_id,
                "type": n.type,
                "channel": n.channel,
                "message": n.message,
                "status": n.status,
                "created_at": n.created_at.isoformat(),
                "sent_at": n.sent_at.isoformat() if n.sent_at else None,
            }
        )
    return result


@router.post("/{notification_id}/retry", status_code=status.HTTP_200_OK)
def retry_notification(
    notification_id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Attempt to resend a failed notification."""
    notif = db.query(Notification).get(notification_id)
    if notif is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    notification_service.send_notification(db, notification_id)

    audit_log_service.create_audit_log(
        db,
        {
            "user_id": admin.id,
            "action": "notification_retry",
            "detail": f"Retried notification {notification_id}",
        },
    )
    return {"detail": "Notification resent"}
