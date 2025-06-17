"""Service functions for handling failed agent tasks."""

# Notes: Datetime for timestamp updates
from datetime import datetime

# Notes: Type hints for database session
from sqlalchemy.orm import Session

# Notes: Import the failure queue model
from models.agent_failure_queue import AgentFailureQueue


def add_failure_to_queue(
    db: Session, user_id: int, agent_name: str, failure_reason: str
) -> AgentFailureQueue:
    """Create a failure queue entry for later retry."""

    # Notes: Instantiate and persist the failure record
    entry = AgentFailureQueue(
        user_id=user_id,
        agent_name=agent_name,
        failure_reason=failure_reason,
        retry_count=0,
        max_retries=3,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def increment_retry_count(db: Session, entry: AgentFailureQueue) -> AgentFailureQueue:
    """Increment the retry count for a queue entry."""

    entry.retry_count += 1
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return entry


def move_to_dead_letter_queue(db: Session, entry: AgentFailureQueue) -> None:
    """Placeholder for future dead letter handling."""

    # Notes: For now we simply remove the entry
    db.delete(entry)
    db.commit()


def process_failure_queue(db: Session) -> None:
    """Process all queued failures, incrementing retries."""

    entries = db.query(AgentFailureQueue).all()
    for entry in entries:
        if entry.retry_count >= entry.max_retries:
            move_to_dead_letter_queue(db, entry)
            continue
        increment_retry_count(db, entry)
        if entry.retry_count >= entry.max_retries:
            move_to_dead_letter_queue(db, entry)
