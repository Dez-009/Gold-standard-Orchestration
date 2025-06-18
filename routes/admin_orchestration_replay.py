"""Admin route providing orchestration replay functionality."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.orchestration_replay_service import replay_orchestration

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/orchestration-replay/{log_id}")
def orchestration_replay(
    log_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Replay an orchestration run using the latest agent logic."""

    try:
        result = replay_orchestration(db, UUID(log_id))
    except ValueError:
        raise HTTPException(status_code=404, detail="Log not found")
    return result

# Footnote: Limited to admins for debugging historical orchestration runs.
