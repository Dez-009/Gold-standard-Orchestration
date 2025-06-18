"""Admin route for viewing wearable sync log entries."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.wearable_sync_service import get_sync_logs

# Notes: Registered under /admin prefix for all admin tooling
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/wearables/sync-logs")
def list_wearable_sync_logs(
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return paginated wearable sync logs for admin auditing."""

    # Notes: Fetch rows from service applying pagination
    rows = get_sync_logs(db, limit=limit, offset=offset)

    # Notes: Serialize ORM objects into primitives for JSON output
    return [
        {
            "id": str(row.id),
            "user_id": row.user_id,
            "device_type": row.device_type,
            "sync_status": row.sync_status.value,
            "synced_at": row.synced_at.isoformat(),
            "raw_data_url": row.raw_data_url,
        }
        for row in rows
    ]

# Footnote: Allows admins to trace wearable ingestion issues.
