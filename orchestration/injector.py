"""Utilities for injecting persona token traits into agent prompts."""

from __future__ import annotations

from sqlalchemy.orm import Session

from services import persona_token_service, wearable_service
from models.wearable_sync import WearableDataType


def apply_persona_token(
    db: Session, user_id: int, agent_name: str, messages: list[dict]
) -> list[dict]:
    """Insert persona token description into the prompt messages."""

    token = persona_token_service.get_token(db, user_id)
    snippet = persona_token_service.enforce_token(agent_name, token)
    if snippet:
        # Notes: Insert as system message after the primary persona prompt
        messages.insert(1, {"role": "system", "content": snippet})
    return messages


def inject_wearable_context(db: Session, user_id: int, messages: list[dict]) -> list[dict]:
    """Add recent wearable data to the conversation if available."""

    row = wearable_service.fetch_latest_data(db, user_id, WearableDataType.SLEEP)
    if row:
        context = f"User slept {row.value} hrs last night."
    else:
        context = "No recent wearable data available."

    # Notes: Prepend the wearable context as a system message
    messages.insert(1, {"role": "system", "content": context})
    return messages

# Footnote: Called during orchestration to personalize agent behavior.
