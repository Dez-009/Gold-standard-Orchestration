"""Tests for subscription tier based agent access policies."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services import agent_access_service
from models.user import User
from models.subscription import Subscription
from models.agent_access_policy import AgentAccessPolicy, SubscriptionTier
from tests.conftest import TestingSessionLocal


def create_user(db):
    user = User(
        email=f"a_{uuid.uuid4().hex}@b.com",
        phone_number=str(int(uuid.uuid4().int % 1_000_000_000)).zfill(9),
        hashed_password="x",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_policy_blocks_free_user():
    db = TestingSessionLocal()
    user = create_user(db)
    db.add(
        AgentAccessPolicy(
            agent_name="career",
            subscription_tier=SubscriptionTier.free,
            is_enabled=False,
        )
    )
    db.commit()
    assert not agent_access_service.is_agent_enabled_for_user(db, "career", user)
    db.close()


def test_policy_allows_premium_user():
    db = TestingSessionLocal()
    user = create_user(db)
    db.add(Subscription(user_id=user.id, stripe_subscription_id="s123", status="active"))
    db.add(
        AgentAccessPolicy(
            agent_name="career",
            subscription_tier=SubscriptionTier.premium,
            is_enabled=True,
        )
    )
    db.commit()
    assert agent_access_service.is_agent_enabled_for_user(db, "career", user)
    db.close()


