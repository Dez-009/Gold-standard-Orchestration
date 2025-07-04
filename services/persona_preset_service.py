"""Service functions for CRUD operations on persona presets."""

from __future__ import annotations

# Notes: typing for the DB session
from sqlalchemy.orm import Session
# Notes: Built-in uuid type for id conversion
from uuid import UUID

# Notes: ORM model representing persona presets
from models.persona_preset import PersonaPreset
from utils.logger import get_logger

logger = get_logger()


def list_presets(db: Session) -> list[PersonaPreset]:
    """Return all saved persona presets."""
    return db.query(PersonaPreset).order_by(PersonaPreset.created_at).all()


def create_preset(db: Session, data: dict) -> PersonaPreset:
    """Validate and persist a new preset."""
    name = data.get("name")
    traits = data.get("traits")
    if not name or not isinstance(traits, dict):
        raise ValueError("Invalid preset data")
    preset = PersonaPreset(
        name=name,
        description=data.get("description", ""),
        traits=traits,
    )
    db.add(preset)
    db.commit()
    db.refresh(preset)
    logger.info("persona_preset_created", extra={"preset_name": name})
    return preset


def update_preset(db: Session, preset_id: str, data: dict) -> PersonaPreset:
    """Update an existing preset by ``preset_id``."""
    # Notes: retrieve preset via session.get (SQLAlchemy 2.0)
    preset = db.get(PersonaPreset, UUID(preset_id))
    if not preset:
        raise ValueError("Preset not found")
    if "name" in data:
        preset.name = data["name"]
    if "description" in data:
        preset.description = data["description"]
    if "traits" in data and isinstance(data["traits"], dict):
        preset.traits = data["traits"]
    db.commit()
    db.refresh(preset)
    logger.info("persona_preset_updated", extra={"preset_id": preset_id})
    return preset


def delete_preset(db: Session, preset_id: str) -> None:
    """Remove the preset from the database."""
    # Notes: session.get avoids deprecation warning
    preset = db.get(PersonaPreset, UUID(preset_id))
    if not preset:
        raise ValueError("Preset not found")
    db.delete(preset)
    db.commit()
    logger.info("persona_preset_deleted", extra={"preset_id": preset_id})
    return None

# Footnote: Provides validation and logging for persona preset CRUD.

