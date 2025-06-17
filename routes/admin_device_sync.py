"""Admin routes exposing device synchronization logs."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.device_sync_service import get_recent_syncs

# Notes: Prefix ensures final path is /admin/device-sync-logs
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/device-sync-logs")
def list_device_sync_logs(
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return paginated device sync history for administrative review."""

    # Notes: Retrieve sync rows from the service layer
    rows = get_recent_syncs(db, limit=limit, offset=offset)

    # Notes: Convert ORM objects to primitives for JSON response
    return [
        {
            "id": str(row.id),
            "user_id": row.user_id,
            "source": row.source,
            "sync_status": row.sync_status,
            "synced_at": row.synced_at.isoformat(),
            "raw_data_preview": row.raw_data_preview,
        }
        for row in rows
    ]

# Footnote: Enables admins to audit device data ingestion.
