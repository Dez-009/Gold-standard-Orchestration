"""Tests for role-based agent access control utility."""

import sys
import os
from models.user import User

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.agent_access_control import is_agent_accessible, AGENT_ROLE_REQUIREMENTS


def test_access_denied_for_basic_user():
    """User without required role should be blocked."""

    user = User(id=1, email="a@b.com", hashed_password="x", role="user")
    assert not is_agent_accessible("GoalSuggestionAgent", user)


def test_access_allowed_for_admin():
    """Admin role bypasses restrictions."""

    user = User(id=2, email="a@b.com", hashed_password="x", role="admin")
    assert is_agent_accessible("GoalSuggestionAgent", user)


def test_agent_without_rule_is_open():
    """Agents not listed in mapping should allow all roles."""

    user = User(id=3, email="a@b.com", hashed_password="x", role="user")
    assert is_agent_accessible("career", user)
