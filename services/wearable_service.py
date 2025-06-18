"""Service layer for persisting and retrieving wearable metrics."""

# Notes: Import standard typing helpers
from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from models.wearable_sync import WearableSyncData, WearableDataType
from utils.logger import get_logger

logger = get_logger()


def store_sync_data(
    db: Session,
    user_id: int,
    source: str,
    data_type: WearableDataType,
    value: str | int | float,
    timestamp: datetime,
) -> WearableSyncData:
    """Validate and persist a wearable metric for the user."""

    # Notes: Basic validation to ensure a value was provided
    if value is None:
        raise ValueError("value is required")

    row = WearableSyncData(
        user_id=user_id,
        source=source,
        data_type=data_type,
        value=str(value),
        recorded_at=timestamp,
        created_at=datetime.utcnow(),
    )

    try:
        # Notes: Add and commit the new data row
        db.add(row)
        db.commit()
        db.refresh(row)
        logger.info(
            "Stored wearable data %s for user %s", data_type.value, user_id
        )
        return row
    except Exception as exc:  # noqa: BLE001
        # Notes: Rollback on error and log the exception
        db.rollback()
        logger.exception("Failed to store wearable data: %s", exc)
        raise


def fetch_latest_data(
    db: Session, user_id: int, data_type: WearableDataType
) -> WearableSyncData | None:
    """Return the most recent metric of the given type for the user."""

    return (
        db.query(WearableSyncData)
        .filter(
            WearableSyncData.user_id == user_id,
            WearableSyncData.data_type == data_type,
        )
        .order_by(WearableSyncData.recorded_at.desc())
        .first()
    )

# Footnote: Logging ensures that ingestion issues can be debugged if data fails to store.
