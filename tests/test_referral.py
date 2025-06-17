"""Tests for referral service functions."""

import os
import sys
from uuid import uuid4

from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.session import SessionLocal, engine
from database.base import Base
from services import referral_service, user_service


def create_user(db: Session) -> int:
    """Helper to create a user and return its id."""
    user = user_service.create_user(
        db,
        {
            "email": f"ref_{uuid4().hex}@example.com",
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    return user.id


def test_referral_code_creation_and_redemption():
    """Referral codes should be generated and redeemed correctly."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create the referrer and ensure a code exists
    referrer_id = create_user(db)
    record = referral_service.get_or_create_referral(db, referrer_id)
    assert record.referral_code is not None

    # Register a second user and redeem the code
    referred_id = create_user(db)
    redeemed = referral_service.redeem_referral(db, record.referral_code, referred_id)
    assert redeemed is not None
    assert redeemed.referred_user_id == referred_id
    db.close()
