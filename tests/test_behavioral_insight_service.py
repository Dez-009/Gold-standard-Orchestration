"""Unit tests for the behavioral insight service."""

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
from services import behavioral_insight_service


def setup_user(db: Session) -> User:
    """Create and return a user for testing."""

    user = User(
        email=f"insight_{uuid4().hex}@example.com",
        phone_number=str(int(uuid4().int % 10_000_000_000)).zfill(10),
        hashed_password="pass",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_generate_and_list_insights():
    """Service should store and retrieve behavioral insights."""

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    user = setup_user(db)

    # Notes: Generate and store a simple insight
    insight = behavioral_insight_service.generate_and_store_behavioral_insight(
        db,
        user.id,
        {"journals": [1, 2], "goals": [1], "checkins": [1], "type": "journal"},
    )
    assert insight.id is not None

    # Notes: Retrieve insights for the user and validate
    items = behavioral_insight_service.list_behavioral_insights(db, user.id)
    assert len(items) == 1
    assert items[0].id == insight.id
    db.close()
