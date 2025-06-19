"""Service helpers for managing prompt template versions."""

from __future__ import annotations

# Notes: Typing helper for DB sessions
from sqlalchemy.orm import Session

# Notes: ORM model representing a versioned prompt
from models.prompt_version import PromptVersion


def create_prompt_version(
    db: Session,
    agent_name: str,
    version: str,
    template: str,
    metadata: dict | None = None,
) -> PromptVersion:
    """Persist a new prompt version row and return it."""

    # Notes: Instantiate the model and commit to the database
    record = PromptVersion(
        agent_name=agent_name,
        version=version,
        prompt_template=template,
        metadata_json=metadata,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_latest_prompt(db: Session, agent_name: str) -> PromptVersion | None:
    """Return the most recently created prompt version for ``agent_name``."""

    return (
        db.query(PromptVersion)
        .filter(PromptVersion.agent_name == agent_name)
        .order_by(PromptVersion.created_at.desc())
        .first()
    )


def get_prompt_by_version(
    db: Session, agent_name: str, version: str
) -> PromptVersion | None:
    """Return a specific prompt version for ``agent_name``."""

    return (
        db.query(PromptVersion)
        .filter(
            PromptVersion.agent_name == agent_name,
            PromptVersion.version == version,
        )
        .first()
    )


def list_prompt_versions(db: Session, agent_name: str | None = None) -> list[PromptVersion]:
    """Return all prompt versions optionally filtered by agent."""

    query = db.query(PromptVersion).order_by(PromptVersion.created_at.desc())
    if agent_name:
        query = query.filter(PromptVersion.agent_name == agent_name)
    return query.all()

# Footnote: Separates prompt version CRUD logic for easier testing.
