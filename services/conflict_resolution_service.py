"""Service functions for persisting and retrieving conflict flags."""

from __future__ import annotations

# Notes: Import SQLAlchemy session type annotation
from sqlalchemy.orm import Session

# Notes: ORM model storing conflict flags
from models.conflict_flag import ConflictFlag


# Notes: Persist a list of detected flags for a journal

def save_conflict_flags(
    db: Session, user_id: int, journal_id: int | None, flags: list[ConflictFlag]
) -> list[ConflictFlag]:
    """Save provided conflict flags linked to a journal entry."""

    saved: list[ConflictFlag] = []
    for flag in flags:
        flag.user_id = user_id
        flag.journal_id = journal_id
        db.add(flag)
        saved.append(flag)
    db.commit()
    for flag in saved:
        db.refresh(flag)
    return saved


# Notes: Retrieve all flags associated with a user

def get_conflict_flags(db: Session, user_id: int | None) -> list[ConflictFlag]:
    """Return flags for the user or all flags when user_id is None."""

    query = db.query(ConflictFlag)
    if user_id is not None:
        query = query.filter(ConflictFlag.user_id == user_id)
    return query.order_by(ConflictFlag.created_at.desc()).all()


# Notes: Mark a flag as resolved for the given id

def mark_flag_resolved(db: Session, flag_id: str) -> ConflictFlag | None:
    """Set resolved=True for the specified flag."""

    from uuid import UUID

    flag = (
        db.query(ConflictFlag)
        .filter(ConflictFlag.id == UUID(str(flag_id)))
        .first()
    )
    if not flag:
        return None
    flag.resolved = True
    db.commit()
    db.refresh(flag)
    return flag

# Footnote: These helpers support the conflict resolution workflow.
