"""Admin endpoints for managing agent access policies."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from models.agent_state import AgentState, AgentAccessTier

router = APIRouter(prefix="/admin/agent-access", tags=["admin"])


@router.get("/")
def list_tiers(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return the required tier for each agent."""
    rows = (
        db.query(AgentState.agent_name, AgentState.access_tier)
        .group_by(AgentState.agent_name, AgentState.access_tier)
        .all()
    )
    return [
        {"agent_name": r[0], "access_tier": r[1].value}
        for r in rows
    ]


@router.post("/update")
def update_tier(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Update the required tier for an agent."""
    agent_name = payload.get("agent_name")
    tier = payload.get("access_tier")
    if not agent_name or not tier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    try:
        tier_enum = AgentAccessTier(tier)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tier") from exc
    db.query(AgentState).filter(AgentState.agent_name == agent_name).update({"access_tier": tier_enum})
    db.commit()
    return {"agent_name": agent_name, "access_tier": tier_enum.value}

