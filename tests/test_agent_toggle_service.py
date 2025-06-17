"""Tests for the agent toggle service."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services import agent_toggle_service
from tests.conftest import TestingSessionLocal


def test_toggle_workflow():
    """Verify agents can be enabled and disabled."""
    db = TestingSessionLocal()

    # Notes: No record means agent defaults to enabled
    assert agent_toggle_service.is_agent_enabled(db, "career")

    # Notes: Disable the agent and verify state
    agent_toggle_service.set_agent_enabled(db, "career", False)
    assert not agent_toggle_service.is_agent_enabled(db, "career")
    assert "career" not in agent_toggle_service.get_enabled_agents(db)

    # Notes: Re-enable and confirm
    agent_toggle_service.set_agent_enabled(db, "career", True)
    assert agent_toggle_service.is_agent_enabled(db, "career")

    db.close()
