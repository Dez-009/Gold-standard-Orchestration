from sqlalchemy.orm import Session

from models.user import User
from utils.password_utils import hash_password


def create_user(db: Session, user_data: dict) -> User:
    """Create a new user and save it to the database."""
    # Hash the plain text password before storing it
    hashed_pw = hash_password(user_data["hashed_password"])
    user_data["hashed_password"] = hashed_pw

    # Persist the new user in the database
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
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
