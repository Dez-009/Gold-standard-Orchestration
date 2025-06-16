"""Unit tests for the health check-in service."""

import os
import sys
from uuid import uuid4

from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal, engine
from database.base import Base
from models.user import User
from services import daily_checkin_service
from models.daily_checkin import Mood


def setup_user(db: Session) -> User:
    """Create a user for testing."""
    user = User(
        email=f"check_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_create_and_retrieve_checkin():
    """Service should persist and return health check-ins."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    user = setup_user(db)
    created = daily_checkin_service.create_checkin(
        db,
        user.id,
        Mood.GOOD,
        7,
        4,
        "test",
    )
    assert created.id is not None

    items = daily_checkin_service.get_checkins(db, user.id)
    assert len(items) == 1
    assert items[0].id == created.id
    db.close()
