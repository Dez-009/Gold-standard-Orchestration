from sqlalchemy.orm import Session

from models.session import Session as SessionModel


def create_session(db: Session, session_data: dict) -> SessionModel:
    """Create a new conversation session and persist it."""
    new_session = SessionModel(**session_data)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


def get_session_by_id(db: Session, session_id: int) -> SessionModel | None:
    """Return a session by its ID or None if not found."""
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()


def get_sessions_by_user(db: Session, user_id: int) -> list[SessionModel]:
    """Return all sessions for a specific user."""
    return db.query(SessionModel).filter(SessionModel.user_id == user_id).all()
