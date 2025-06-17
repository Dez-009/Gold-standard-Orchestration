"""Service layer functions for admin controlled agent toggles."""

from __future__ import annotations

# Notes: typing for the DB session
from sqlalchemy.orm import Session

# Notes: ORM model storing toggle records
from models.agent_settings import AgentToggle
from utils.logger import get_logger

logger = get_logger()


def get_enabled_agents(db: Session) -> list[str]:
    """Return the names of all agents currently enabled."""
    toggles = db.query(AgentToggle).filter(AgentToggle.enabled.is_(True)).all()
    return [t.agent_name for t in toggles]


def is_agent_enabled(db: Session, agent_name: str) -> bool:
    """Check whether ``agent_name`` is enabled. Defaults to True."""
    toggle = (
        db.query(AgentToggle).filter(AgentToggle.agent_name == agent_name).first()
    )
    if toggle is None:
        logger.info(
            "agent_toggle_missing_default_enabled", extra={"agent": agent_name}
        )
        return True
    return bool(toggle.enabled)


def set_agent_enabled(db: Session, agent_name: str, enabled: bool) -> AgentToggle:
    """Create or update the toggle for ``agent_name``."""
    try:
        toggle = (
            db.query(AgentToggle)
            .filter(AgentToggle.agent_name == agent_name)
            .first()
        )
        if toggle:
            toggle.enabled = enabled
        else:
            toggle = AgentToggle(agent_name=agent_name, enabled=enabled)
            db.add(toggle)
        db.commit()
        db.refresh(toggle)
        logger.info(
            "agent_toggle_set", extra={"agent": agent_name, "enabled": enabled}
        )
        return toggle
    except Exception as exc:  # pragma: no cover - unexpected db errors
        db.rollback()
        logger.error("agent_toggle_error", exc_info=exc)
        raise

# Footnote: Provides CRUD helpers for admin agent toggles.
