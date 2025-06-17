"""Service for storing and retrieving user agent personalization profiles."""

# Notes: Import datetime to timestamp updates
from datetime import datetime

from sqlalchemy.orm import Session

from models.agent_personalization import AgentPersonalization


def set_agent_personality(
    db: Session,
    user_id: int,
    agent_name: str,
    personality_profile: str,
) -> AgentPersonalization:
    """Create or update an agent personalization profile."""

    # Notes: Attempt to find an existing profile for the user and agent
    record = (
        db.query(AgentPersonalization)
        .filter(
            AgentPersonalization.user_id == user_id,
            AgentPersonalization.agent_name == agent_name,
        )
        .one_or_none()
    )

    if record:
        # Notes: Update profile text and timestamp when found
        record.personality_profile = personality_profile
        record.updated_at = datetime.utcnow()
    else:
        # Notes: Create a new profile when none exists
        record = AgentPersonalization(
            user_id=user_id,
            agent_name=agent_name,
            personality_profile=personality_profile,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


def get_agent_personality(
    db: Session, user_id: int, agent_name: str
) -> AgentPersonalization | None:
    """Retrieve the personalization profile for a given user and agent."""

    # Notes: Simple lookup by user and agent name
    return (
        db.query(AgentPersonalization)
        .filter(
            AgentPersonalization.user_id == user_id,
            AgentPersonalization.agent_name == agent_name,
        )
        .one_or_none()
    )


def list_agent_personalities(db: Session, user_id: int) -> list[AgentPersonalization]:
    """Return all personalization records belonging to a user."""

    # Notes: Retrieve all profiles ordered by creation time
    return (
        db.query(AgentPersonalization)
        .filter(AgentPersonalization.user_id == user_id)
        .order_by(AgentPersonalization.created_at.desc())
        .all()
    )


# Footnote: Centralizes logic for persisting user-customized agent personalities
