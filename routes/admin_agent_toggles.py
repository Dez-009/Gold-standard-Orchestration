"""Admin endpoints for managing runtime agent toggles."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import agent_toggle_service

router = APIRouter(prefix="/admin/agent-toggles", tags=["admin"])


@router.get("/")
def list_agent_toggles(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all agent toggles and their states."""
    toggles = db.query(agent_toggle_service.AgentToggle).all()
    return [
        {
            "agent_name": t.agent_name,
            "enabled": t.enabled,
            "updated_at": t.updated_at.isoformat(),
        }
        for t in toggles
    ]


@router.post("/")
def update_agent_toggle(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Set enabled status for a specific agent."""
    agent_name = payload.get("agent_name")
    enabled = payload.get("enabled")
    if agent_name is None or enabled is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    toggle = agent_toggle_service.set_agent_enabled(db, str(agent_name), bool(enabled))
    return {
        "agent_name": toggle.agent_name,
        "enabled": toggle.enabled,
        "updated_at": toggle.updated_at.isoformat(),
    }

# Footnote: Provides CRUD endpoints for admin agent toggles.
