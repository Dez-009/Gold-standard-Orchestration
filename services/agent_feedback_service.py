"""Service layer for storing and retrieving agent feedback."""

from sqlalchemy.orm import Session
from uuid import UUID

from models.agent_feedback import AgentFeedback
from utils.logger import get_logger

logger = get_logger()


def create_feedback(
    db: Session,
    user_id: int,
    summary_id: str | UUID,
    reaction: str,
    comment: str | None,
) -> AgentFeedback:
    """Persist a new AgentFeedback record."""
    # Notes: Instantiate ORM object with provided values
    record = AgentFeedback(
        user_id=user_id,
        summary_id=UUID(str(summary_id)),
        emoji_reaction=reaction,
        feedback_text=comment,
    )
    # Notes: Add and commit within the active DB session
    db.add(record)
    db.commit()
    db.refresh(record)
    # Notes: Log creation event for analytics
    logger.info(
        "agent_feedback_created",
        extra={"user": user_id, "summary": summary_id, "reaction": reaction},
    )
    return record


def get_feedback(db: Session, summary_id: str | UUID) -> AgentFeedback | None:
    """Return feedback for a given summary if it exists."""
    # Notes: Query the table filtering by summary id
    return (
        db.query(AgentFeedback)
        .filter(AgentFeedback.summary_id == UUID(str(summary_id)))
        .first()
    )

