"""Service helpers for managing flag reasons."""

from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session

from models.flag_reason import FlagReason


def list_flag_reasons(db: Session) -> list[FlagReason]:
    """Return all available flag reasons ordered by creation time."""
    return db.query(FlagReason).order_by(FlagReason.created_at.desc()).all()


def create_flag_reason(db: Session, label: str, category: str | None) -> FlagReason:
    """Create a new flag reason entry."""
    reason = FlagReason(label=label, category=category)
    db.add(reason)
    db.commit()
    db.refresh(reason)
    return reason


def delete_flag_reason(db: Session, id: UUID) -> bool:
    """Delete an existing reason by id. Returns True if deleted."""
    row = db.query(FlagReason).filter(FlagReason.id == id).first()
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True

# Footnote: These helpers back the admin CRUD API for flag reasons.
