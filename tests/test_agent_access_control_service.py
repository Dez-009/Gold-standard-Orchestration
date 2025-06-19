"""Tests for role tier agent access service."""

import os
import sys
from models.user import User
from models.agent_state import AgentState, AgentStateStatus, AgentAccessTier
from tests.conftest import TestingSessionLocal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.agent_access_control_service import is_agent_allowed


def test_denies_when_tier_too_low():
    db = TestingSessionLocal()
    user = User(email="u@example.com", hashed_password="x", role="free")
    db.add(user)
    db.commit()
    db.refresh(user)
    state = AgentState(
        user_id=user.id,
        agent_name="career",
        state=AgentStateStatus.ACTIVE,
        access_tier=AgentAccessTier.pro,
    )
    db.add(state)
    db.commit()

    assert not is_agent_allowed(db, user.role, "career")
    db.close()


def test_admin_bypasses_check():
    db = TestingSessionLocal()
    state = AgentState(
        user_id=1,
        agent_name="career",
        state=AgentStateStatus.ACTIVE,
        access_tier=AgentAccessTier.pro,
    )
    db.add(state)
    db.commit()

    assert is_agent_allowed(db, "admin", "career")
    db.close()
