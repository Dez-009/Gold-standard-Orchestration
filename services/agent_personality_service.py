"""Service layer for user agent personality assignments."""

# Notes: Import datetime to record assignment timestamps
from datetime import datetime
# Notes: Import SQLAlchemy session type
from sqlalchemy.orm import Session

# Notes: ORM models used in this service
from models.user_personality import UserPersonality
from models.personality import Personality


def assign_personality(
    db: Session, user_id: int, domain: str, personality: str
) -> UserPersonality:
    """Create or update a personality assignment for a user."""

    # Notes: Look up the Personality record by name
    personality_obj = (
        db.query(Personality).filter(Personality.name == personality).first()
    )
    if personality_obj is None:
        raise ValueError("Personality not found")

    # Notes: Retrieve any existing assignment for the user and domain
    assignment = (
        db.query(UserPersonality)
        .filter(
            UserPersonality.user_id == user_id,
            UserPersonality.domain == domain,
        )
        .first()
    )

    if assignment:
        # Notes: Update the personality reference and timestamp
        assignment.personality_id = personality_obj.id
        assignment.assigned_at = datetime.utcnow()
    else:
        # Notes: Create a new record when none exists
        assignment = UserPersonality(
            user_id=user_id,
            domain=domain,
            personality_id=personality_obj.id,
            assigned_at=datetime.utcnow(),
        )
        db.add(assignment)

    # Notes: Persist changes to the database
    db.commit()
    db.refresh(assignment)
    return assignment


def get_personality_assignment(
    db: Session, user_id: int, domain: str
) -> UserPersonality | None:
    """Return the user's personality assignment for the given domain."""

    # Notes: Query the table filtering by user and domain
    return (
        db.query(UserPersonality)
        .filter(
            UserPersonality.user_id == user_id,
            UserPersonality.domain == domain,
        )
        .first()
    )
