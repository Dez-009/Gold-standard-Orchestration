"""Service layer for managing referral codes and redemptions."""

from __future__ import annotations

import string
import random
from sqlalchemy.orm import Session

from models.referral import Referral


def _generate_code(length: int = 8) -> str:
    """Return a random alphanumeric referral code."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choices(alphabet, k=length))


def create_referral_record(db: Session, user_id: int) -> Referral:
    """Create a unique referral code for the given user."""
    # Notes: Loop until a unique code is generated
    code = _generate_code()
    while db.query(Referral).filter(Referral.referral_code == code).first():
        code = _generate_code()

    # Notes: Persist the referral record for this user
    record = Referral(referrer_user_id=user_id, referral_code=code)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_referral_by_user(db: Session, user_id: int) -> Referral | None:
    """Return the referral record associated with the given user."""
    return db.query(Referral).filter(Referral.referrer_user_id == user_id).first()


def get_or_create_referral(db: Session, user_id: int) -> Referral:
    """Retrieve or create the referral record for a user."""
    record = get_referral_by_user(db, user_id)
    if record:
        return record
    return create_referral_record(db, user_id)


def lookup_referral(db: Session, code: str) -> Referral | None:
    """Find the referral record by its code."""
    return db.query(Referral).filter(Referral.referral_code == code).first()


def redeem_referral(db: Session, code: str, new_user_id: int) -> Referral | None:
    """Assign the referred user to the referral record if valid."""
    record = lookup_referral(db, code)
    if record and record.referred_user_id is None:
        # Notes: Record the newly registered user as the referral target
        record.referred_user_id = new_user_id
        db.commit()
        db.refresh(record)
    return record
