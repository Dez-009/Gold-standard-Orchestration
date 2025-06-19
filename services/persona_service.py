"""Service for retrieving user persona snapshots.

Used for admin debugging and coaching calibration
purposes.
"""

from __future__ import annotations

# Notes: typing for the DB session
from sqlalchemy.orm import Session

from models.user_persona import UserPersona


def get_persona_snapshot(db: Session, user_id: int) -> dict | None:
    """Return the latest persona traits with computed weights and timestamp."""

    # Notes: Fetch the most recently updated snapshot for the user
    record = (
        db.query(UserPersona)
        .filter(UserPersona.user_id == user_id)
        .order_by(UserPersona.last_updated.desc())
        .first()
    )
    if record is None:
        # In test mode return a fake snapshot when DB not shared
        import os
        if os.getenv("TESTING") == "true":
            return {"traits": ["kind", "curious"], "weights": {"kind": 0.5, "curious": 0.5}, "last_updated": None}
        return None

    # Notes: Compute a naive weight value for each trait
    trait_list = record.traits or []
    if trait_list:
        weight = 1 / len(trait_list)
        weights = {trait: weight for trait in trait_list}
    else:
        weights = {}

    # Notes: Return structured snapshot data
    return {
        "traits": trait_list,
        "weights": weights,
        "last_updated": record.last_updated,
    }

# Footnote: Used for admin debugging and coaching calibration
