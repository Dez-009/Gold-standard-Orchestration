"""Admin endpoints for reviewing flagged agent output."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import agent_flag_service

router = APIRouter(prefix="/admin/agent-flags", tags=["admin"])


@router.get("/")
# Notes: Return all flags filtered by optional reviewed state
def list_flags(
    reviewed: bool | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Retrieve flagged agent outputs."""

    flags = agent_flag_service.list_flags(db, reviewed)
    return [
        {
            "id": str(f.id),
            "agent_name": f.agent_name,
            "user_id": f.user_id,
            "summary_id": str(f.summary_id) if f.summary_id else None,
            "reason": f.reason,
            "created_at": f.created_at.isoformat(),
            "reviewed": f.reviewed,
        }
        for f in flags
    ]


@router.post("/review")
# Notes: Mark a specific flag as reviewed
def review_flag(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Set reviewed=True for the provided flag id."""

    flag_id = payload.get("flag_id")
    if not flag_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="flag_id required")
    flag = agent_flag_service.mark_flag_reviewed(db, str(flag_id))
    if flag is None:
        raise HTTPException(status_code=404, detail="Flag not found")
    return {"status": "ok", "flag_id": str(flag.id)}

# Footnote: Admins use these endpoints to manage questionable agent outputs.
