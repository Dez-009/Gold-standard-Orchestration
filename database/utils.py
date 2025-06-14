from typing import Generator

from sqlalchemy.orm import Session

from .session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a new database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
