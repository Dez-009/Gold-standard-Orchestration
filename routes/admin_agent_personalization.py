"""Admin routes for managing agent personalization profiles."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import agent_personalization_service

router = APIRouter(prefix="/admin/agent-personalizations", tags=["admin"])


@router.get("/")
def list_agent_personalizations(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
    limit: int = 100,
    offset: int = 0,
) -> list[dict]:
    """Return all agent personalization records."""

    # Notes: Query database for all personalization profiles
    rows = (
        db.query(agent_personalization_service.AgentPersonalization)
        .order_by(agent_personalization_service.AgentPersonalization.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Notes: Convert ORM objects to dictionaries for response
    return [
        {
            "id": str(row.id),
            "user_id": row.user_id,
            "agent_name": row.agent_name,
            "personality_profile": row.personality_profile,
            "created_at": row.created_at.isoformat(),
            "updated_at": row.updated_at.isoformat(),
        }
        for row in rows
    ]


@router.post("/update")
def update_agent_personalization(
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Modify an existing or new agent personalization profile."""

    # Notes: Validate required parameters in the request body
    user_id = payload.get("user_id")
    agent_name = payload.get("agent_name")
    profile = payload.get("personality_profile")
    if not all([user_id, agent_name, profile]):
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Notes: Delegate persistence to the service layer
    record = agent_personalization_service.set_agent_personality(
        db, user_id, agent_name, profile
    )

    return {
        "id": str(record.id),
        "user_id": record.user_id,
        "agent_name": record.agent_name,
        "personality_profile": record.personality_profile,
        "created_at": record.created_at.isoformat(),
        "updated_at": record.updated_at.isoformat(),
    }

# Footnote: Provides admin-only endpoints to inspect and update personalization
# profiles for troubleshooting or manual adjustments.
