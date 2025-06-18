"""Admin endpoints for managing agent access policies."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from models.agent_access_policy import AgentAccessPolicy, SubscriptionTier

router = APIRouter(prefix="/admin/agent-access", tags=["admin"])


@router.get("/")
def list_policies(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all agent access policies."""
    rows = db.query(AgentAccessPolicy).all()
    return [
        {
            "agent_name": r.agent_name,
            "subscription_tier": r.subscription_tier.value,
            "is_enabled": r.is_enabled,
        }
        for r in rows
    ]


@router.post("/update")
def update_policy(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Create or update a policy entry."""
    agent_name = payload.get("agent_name")
    tier = payload.get("subscription_tier")
    enabled = payload.get("is_enabled")
    if not agent_name or not tier or enabled is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    try:
        tier_enum = SubscriptionTier(tier)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tier") from exc
    policy = (
        db.query(AgentAccessPolicy)
        .filter(
            AgentAccessPolicy.agent_name == agent_name,
            AgentAccessPolicy.subscription_tier == tier_enum,
        )
        .first()
    )
    if policy:
        policy.is_enabled = bool(enabled)
    else:
        policy = AgentAccessPolicy(
            agent_name=agent_name,
            subscription_tier=tier_enum,
            is_enabled=bool(enabled),
        )
        db.add(policy)
    db.commit()
    db.refresh(policy)
    return {
        "agent_name": policy.agent_name,
        "subscription_tier": policy.subscription_tier.value,
        "is_enabled": policy.is_enabled,
    }

