from sqlalchemy.orm import Session

# Notes: Import the ORM model for personalities
from models.personality import Personality


def create_personality(db: Session, personality_data: dict) -> Personality:
    """Persist a new Personality record."""
    # Notes: Instantiate the model with provided data
    new_personality = Personality(**personality_data)
    db.add(new_personality)
    db.commit()
    db.refresh(new_personality)
    return new_personality


def get_all_personalities(db: Session) -> list[Personality]:
    """Return all saved personalities."""
    # Notes: Query the table for every personality record
    return db.query(Personality).all()


from uuid import UUID


def get_personality(db: Session, personality_id: str) -> Personality | None:
    """Retrieve a single personality by its UUID."""
    # Notes: Convert to UUID object for SQLite compatibility
    pid = UUID(personality_id)
    # Notes: Filter by the primary key
    return db.query(Personality).filter(Personality.id == pid).first()
