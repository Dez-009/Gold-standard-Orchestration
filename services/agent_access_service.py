"""Service evaluating agent access based on subscription tier."""

from __future__ import annotations

from sqlalchemy.orm import Session

from models.user import User
from models.subscription import Subscription
from models.agent_access_policy import AgentAccessPolicy, SubscriptionTier


def _get_user_tier(db: Session, user: User) -> SubscriptionTier:
    """Return the current subscription tier for ``user``."""
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .order_by(Subscription.created_at.desc())
        .first()
    )
    if sub and sub.status in {"active", "trialing"}:
        return SubscriptionTier.premium
    return SubscriptionTier.free


def is_agent_enabled_for_user(db: Session, agent_name: str, user: User) -> bool:
    """Return True if ``agent_name`` is enabled for ``user``'s tier."""
    tier = _get_user_tier(db, user)
    policy = (
        db.query(AgentAccessPolicy)
        .filter(
            AgentAccessPolicy.agent_name == agent_name,
            AgentAccessPolicy.subscription_tier == tier,
        )
        .first()
    )
    if policy is None:
        return True
    return bool(policy.is_enabled)


