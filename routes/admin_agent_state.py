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
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return the most recent state row for all agents."""

    # Notes: Query latest state entries ordered by timestamp
    rows = db.query(agent_state_service.AgentState).order_by(
        agent_state_service.AgentState.updated_at.desc()
    ).all()
    # Notes: Convert ORM objects into simple dictionaries
    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "agent_name": row.agent_name,
            "state": row.state,
            "updated_at": row.updated_at.isoformat(),
        }
        for row in rows
    ]


@router.patch("/{state_id}")
def update_agent_state(
    state_id: str,
    state: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Manually override an agent state."""

    # Notes: Retrieve the record by its UUID
    record = db.query(agent_state_service.AgentState).filter_by(id=state_id).one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="State not found")

    # Notes: Use the service function to validate and update
    updated = agent_state_service.set_agent_state(db, record.user_id, record.agent_name, state)
    return {
        "id": updated.id,
        "user_id": updated.user_id,
        "agent_name": updated.agent_name,
        "state": updated.state,
        "updated_at": updated.updated_at.isoformat(),
    }
