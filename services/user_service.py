from sqlalchemy.orm import Session

from models.user import User
from utils.password_utils import hash_password
# Notes: Import referral service to generate invitation codes
from services import referral_service


def create_user(db: Session, user_data: dict) -> User:
    """Create a new user and save it to the database."""
    # Hash the plain text password before storing it
    hashed_pw = hash_password(user_data["hashed_password"])
    user_data["hashed_password"] = hashed_pw

    # Filter out any unsupported fields (e.g., access_code)
    allowed_keys = {c.name for c in User.__table__.columns}
    filtered = {k: v for k, v in user_data.items() if k in allowed_keys}

    # Persist the new user in the database
    new_user = User(**filtered)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Notes: Generate a referral code tied to the new user
    referral_service.create_referral_record(db, new_user.id)
    return new_user


def get_user_by_email(db: Session, email: str) -> User | None:
    """Return a user by their email or None if not found."""
    # Query the database for a user with a matching email address
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: int) -> User | None:
    """Return a user by their ID or None if not found."""
    # Retrieve a single user by primary key
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session) -> list[User]:
    """Return all users in the system."""
    return db.query(User).all()


def delete_user(db: Session, user: User) -> None:
    """Remove a user and cascade delete related records."""
    # Notes: Issue the ORM delete operation which cascades to relationships
    db.delete(user)
    db.commit()
    return None

def update_user(db: Session, user: User, updates: dict) -> User:
    """Apply field updates to a user."""
    for field, value in updates.items():
        if hasattr(user, field):
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
