"""Service functions for managing user login sessions."""

# Notes: Datetime used for calculating session durations
from datetime import datetime

# Notes: SQLAlchemy session type for DB operations
from sqlalchemy.orm import Session

# Notes: Import the ORM model defined for user sessions
from models.user_session import UserSession


def start_session(
    db: Session,
    user_id: int,
    user_agent: str | None,
    ip_address: str | None,
) -> UserSession:
    """Create and persist a new user session record."""

    # Notes: Build the UserSession object with provided context
    session = UserSession(
        user_id=user_id,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    # Notes: Persist the new session to the database
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def end_session(db: Session, user_id: int) -> UserSession | None:
    """Mark the most recent session for the user as ended."""

    # Notes: Retrieve the last open session for the given user
    session = (
        db.query(UserSession)
        .filter(UserSession.user_id == user_id, UserSession.session_end.is_(None))
        .order_by(UserSession.session_start.desc())
        .first()
    )
    if session:
        # Notes: Set the end timestamp and compute total duration in seconds
        session.session_end = datetime.utcnow()
        delta = session.session_end - session.session_start
        session.total_duration = str(int(delta.total_seconds()))
        db.commit()
        db.refresh(session)
    return session


def get_recent_sessions(db: Session, limit: int = 100) -> list[UserSession]:
    """Return recent sessions ordered by start time descending."""

    # Notes: Execute the query with sorting and limit
    return (
        db.query(UserSession)
        .order_by(UserSession.session_start.desc())
        .limit(limit)
        .all()
    )
