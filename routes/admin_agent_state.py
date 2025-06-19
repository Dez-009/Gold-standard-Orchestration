"""Admin routes for viewing and modifying agent states."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import agent_state_service

router = APIRouter(prefix="/admin/agent-states", tags=["admin"])


@router.get("/")
def list_agent_states(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return a paginated list of all agent states."""

    # Notes: Delegate query logic to the service layer
    rows = agent_state_service.list_all_states(db, limit=limit, offset=offset)

    # Notes: Convert ORM models into primitives for JSON response
    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "agent_name": row.agent_name,
            "state": row.state,
            "created_at": row.created_at.isoformat(),
            "updated_at": row.updated_at.isoformat(),
        }
        for row in rows
    ]


@router.post("/update")
def update_agent_state(
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Allow an admin to modify an agent state."""

    # Notes: Extract required fields from request payload
    user_id = payload.get("user_id")
    agent_name = payload.get("agent_name")
    state = payload.get("state")
    if not all([user_id, agent_name, state]):
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Notes: Perform the update through the service to validate transitions
    updated = agent_state_service.set_agent_state(db, user_id, agent_name, state)
    return {
        "id": updated.id,
        "user_id": updated.user_id,
        "agent_name": updated.agent_name,
        "state": updated.state,
        "created_at": updated.created_at.isoformat(),
        "updated_at": updated.updated_at.isoformat(),
    }

# Footnote: This router allows administrators to manage persistent agent states
