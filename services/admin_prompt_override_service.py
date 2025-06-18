"""Service layer for managing admin prompt overrides."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from models.admin_prompt_override import AdminPromptOverride


def set_custom_prompt(db: Session, agent_name: str, prompt_text: str) -> AdminPromptOverride:
    """Create or update a custom prompt override for the agent."""

    record = db.query(AdminPromptOverride).filter(
        AdminPromptOverride.agent_name == agent_name
    ).first()

    if record:
        # Update existing record
        record.prompt_text = prompt_text
        record.active = True
        record.updated_at = datetime.utcnow()
    else:
        # Create new override record
        record = AdminPromptOverride(
            agent_name=agent_name,
            prompt_text=prompt_text,
            active=True,
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


def get_active_prompt(db: Session, agent_name: str) -> Optional[AdminPromptOverride]:
    """Return the active override prompt for the agent if one exists."""

    return (
        db.query(AdminPromptOverride)
        .filter(
            AdminPromptOverride.agent_name == agent_name,
            AdminPromptOverride.active.is_(True),
        )
        .first()
    )


def deactivate_prompt(db: Session, agent_name: str) -> bool:
    """Deactivate the override prompt for the given agent."""

    record = db.query(AdminPromptOverride).filter(
        AdminPromptOverride.agent_name == agent_name
    ).first()
    if not record:
        return False

    record.active = False
    record.updated_at = datetime.utcnow()
    db.commit()
    return True
