"""Controls feature availability per agent and subscription tier."""

from __future__ import annotations

from uuid import uuid4
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, String, Boolean, DateTime, Enum as PgEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class SubscriptionTier(str, Enum):
    """Supported subscription tiers."""

    free = "free"
    basic = "basic"
    premium = "premium"


class AgentAccessPolicy(Base):
    """Mapping of agent availability per subscription tier."""

    __tablename__ = "agent_access_policies"
    __table_args__ = (
        UniqueConstraint("agent_name", "subscription_tier", name="uq_agent_tier"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_name = Column(String, nullable=False)
    subscription_tier = Column(PgEnum(SubscriptionTier), nullable=False)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


