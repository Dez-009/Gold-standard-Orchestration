"""Service functions for handling user feedback submissions."""

from sqlalchemy.orm import Session

from models.user_feedback import UserFeedback, FeedbackType


def submit_feedback(db: Session, data: dict) -> UserFeedback:
    """Persist a new feedback record."""

    # Notes: Build the ORM object from the provided data
    record = UserFeedback(**data)
    # Notes: Persist the record to the database
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_feedback(
    db: Session,
    limit: int = 100,
    offset: int = 0,
    feedback_type: FeedbackType | None = None,
) -> list[UserFeedback]:
    """Return recent feedback entries optionally filtered by type."""

    # Notes: Base query selecting from the feedback table
    query = db.query(UserFeedback)
    # Notes: Apply type filter when requested
    if feedback_type is not None:
        query = query.filter(UserFeedback.feedback_type == feedback_type)
    # Notes: Order by most recent submissions first
    query = query.order_by(UserFeedback.submitted_at.desc())
    # Notes: Apply pagination parameters
    return query.offset(offset).limit(limit).all()
