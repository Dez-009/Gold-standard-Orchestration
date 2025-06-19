from __future__ import annotations

"""Utility to enforce agent access by subscription tier."""

from sqlalchemy.orm import Session

from models.agent_state import AgentState, AgentAccessTier
from services import agent_access_control
from utils.logger import get_logger

logger = get_logger()

# Notes: Numeric ranking for comparing tiers
_TIER_ORDER = {
    AgentAccessTier.free: 0,
    AgentAccessTier.plus: 1,
    AgentAccessTier.pro: 2,
    AgentAccessTier.admin: 3,
}


class AgentAccessDenied(Exception):
    """Raised when a user lacks permission to run an agent."""


def is_agent_allowed(db: Session, user_role: str, agent_name: str) -> bool:
    """Return True if the user's role meets the agent's required tier."""

    # Check in-memory role map for simple overrides used in tests
    allowed_roles = agent_access_control.AGENT_ROLE_REQUIREMENTS.get(agent_name)
    if allowed_roles is not None:
        if user_role == "admin":
            return True
        return user_role in allowed_roles

    # Notes: Default to ``free`` when no explicit row exists
    state = (
        db.query(AgentState)
        .filter(AgentState.agent_name == agent_name)
        .first()
    )
    required = state.access_tier if state else AgentAccessTier.free

    if user_role == "admin":
        return True

    try:
        user_tier = AgentAccessTier(user_role)
    except ValueError:
        user_tier = AgentAccessTier.free

    allowed = _TIER_ORDER[user_tier] >= _TIER_ORDER[required]
    if not allowed:
        logger.info(
            "agent_access_denied", extra={"agent": agent_name, "role": user_role}
        )
    return allowed
