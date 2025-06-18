"""Service helpers for persisting and reading wearable sync logs."""

# Notes: Import typing helpers
from __future__ import annotations

from datetime import datetime
from typing import List

# Notes: SQLAlchemy session for DB operations
from sqlalchemy.orm import Session

from models.wearable_sync_log import WearableSyncLog, SyncStatus
from utils.logger import get_logger

logger = get_logger()


def log_sync_event(
    db: Session,
    user_id: int,
    device_type: str,
    status: SyncStatus,
    raw_data_url: str | None = None,
) -> WearableSyncLog:
    """Record a wearable synchronization event for auditing purposes."""

    # Notes: Build the ORM instance capturing the sync details
    entry = WearableSyncLog(
        user_id=user_id,
        device_type=device_type,
        sync_status=status,
        synced_at=datetime.utcnow(),
        raw_data_url=raw_data_url,
    )

    try:
        # Notes: Commit the row so it persists in the database
        db.add(entry)
        db.commit()
        db.refresh(entry)
        logger.info("Logged wearable sync event for user %s", user_id)
        return entry
    except Exception as exc:  # noqa: BLE001
        # Notes: Rollback when failure occurs and propagate
        db.rollback()
        logger.exception("Failed to log wearable sync event: %s", exc)
        raise


def get_sync_logs(db: Session, limit: int = 100, offset: int = 0) -> List[WearableSyncLog]:
    """Retrieve sync events ordered by newest first."""

    # Notes: Query database applying pagination
    return (
        db.query(WearableSyncLog)
        .order_by(WearableSyncLog.synced_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

# Footnote: Centralized in this module so multiple routes can reuse logging.
