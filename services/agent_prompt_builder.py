"""Utilities for constructing personalized agent prompts."""

from __future__ import annotations

# Notes: Standard library imports
import json
from typing import Any

# Notes: SQLAlchemy session type for DB operations
from sqlalchemy.orm import Session

# Notes: Service that stores per-user agent personalization profiles
from services import agent_personalization_service

# Notes: Known agent names that support personalization
VALID_AGENT_NAMES = {"career", "health", "relationships", "finance", "mental_health"}


def build_personalized_prompt(
    db: Session, user_id: int, agent_name: str, base_prompt: str
) -> str:
    """Return a prompt merged with any personalization for the user/agent."""

    # Notes: Validate the agent name to avoid bad lookups
    if agent_name not in VALID_AGENT_NAMES:
        raise ValueError("Invalid agent name")

    # Notes: Load the personalization profile from the database
    record = agent_personalization_service.get_agent_personality(db, user_id, agent_name)

    # Notes: When no profile exists, return the unmodified prompt
    if record is None:
        return base_prompt

    # Notes: Attempt to decode the profile text as JSON for structured options
    try:
        profile_data: Any = json.loads(record.personality_profile)
    except json.JSONDecodeError:
        profile_data = None

    if isinstance(profile_data, dict):
        # Notes: Build tuning instructions from JSON keys when provided
        parts: list[str] = []
        tone = profile_data.get("tone")
        style = profile_data.get("style")
        phrasing = profile_data.get("phrasing")
        if tone:
            parts.append(f"Use a {tone} tone.")
        if style:
            parts.append(f"Respond in a {style} style.")
        if phrasing:
            parts.append(str(phrasing))
        if parts:
            prefix = " ".join(parts)
            return f"{prefix}\n\n{base_prompt}"
        return base_prompt

    # Notes: Fallback when personalization is plain text
    return f"{record.personality_profile}\n\n{base_prompt}"

# Footnote: Prompt builder composes user-specific instructions with the base
# prompt. It allows future expansion by reading JSON profiles that tune agent
# behavior while keeping the orchestration layer agnostic of formatting rules.
