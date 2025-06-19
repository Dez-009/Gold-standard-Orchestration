"""Routes for recording and retrieving wearable metrics for users."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.utils import get_db
from middleware.rate_limiter import limiter


def _limit(rate: str):
    """Return limiter decorator when initialized, else no-op."""

    if limiter:
        return limiter.limit(rate)

    def _decorator(func):  # pragma: no cover - executed when limiter missing
        return func

    return _decorator
from models.user import User
from models.wearable_sync import WearableDataType
from services import wearable_service

router = APIRouter(prefix="/user/wearables", tags=["wearables"])


@router.post("/")
@_limit("10/minute")
def push_wearable_data(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Persist a metric sent from the user's wearable device."""

    try:
        data_type = WearableDataType(payload["data_type"])
        value = payload["value"]
        source = payload.get("source", "unknown")
        timestamp = datetime.fromisoformat(payload["recorded_at"])
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    row = wearable_service.store_sync_data(
        db,
        current_user.id,
        source,
        data_type,
        value,
        timestamp,
    )
    return {
        "id": str(row.id),
        "data_type": row.data_type.value,
        "value": row.value,
        "recorded_at": row.recorded_at.isoformat(),
    }


@router.get("/")
@_limit("20/minute")
def get_recent_wearable_data(
    data_type: WearableDataType,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return the most recent metric of the requested type."""

    row = wearable_service.fetch_latest_data(db, current_user.id, data_type)
    if row is None:
        return {"detail": "no data"}
    return {
        "data_type": row.data_type.value,
        "value": row.value,
        "recorded_at": row.recorded_at.isoformat(),
        "source": row.source,
    }

# Footnote: The rate limiter protects against excessive device sync operations.
