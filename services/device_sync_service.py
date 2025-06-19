"""Service functions for recording and retrieving device sync events."""

# Notes: datetime used for timestamp calculations
from datetime import datetime
from typing import List

# Notes: SQLAlchemy session type for database interactions
from sqlalchemy.orm import Session

from models.device_sync import DeviceSyncLog
from utils.logger import get_logger

logger = get_logger()


def log_sync_event(
    db: Session,
    user_id: int,
    source: str,
    status: str,
    data_preview: dict | None,
) -> DeviceSyncLog:
    """Persist a new device sync record."""

    # Notes: Construct the ORM instance representing the sync
    entry = DeviceSyncLog(
        user_id=user_id,
        source=source,
        sync_status=status,
        synced_at=datetime.utcnow(),
        raw_data_preview=data_preview,
        created_at=datetime.utcnow(),
    )

    try:
        # Notes: Add and commit the new row
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
    except Exception as exc:  # noqa: BLE001
        # Notes: Rollback and log when commit fails
        db.rollback()
        logger.exception("Failed to log device sync event: %s", exc)
        raise


def get_recent_syncs(db: Session, limit: int = 100, offset: int = 0) -> List[DeviceSyncLog]:
    """Return the most recent sync events in descending order."""

    # Notes: Query database applying ordering and pagination
    rows = (
        db.query(DeviceSyncLog)
        .order_by(DeviceSyncLog.synced_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return rows

# Footnote: Service centralizes logic for device synchronization history.
