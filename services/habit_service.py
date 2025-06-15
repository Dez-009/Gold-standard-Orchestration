"""Business logic for user habits."""

# Notes: Import SQLAlchemy session type and habit model
from sqlalchemy.orm import Session
from models.habit import Habit
from datetime import datetime


def create_habit(db: Session, habit_data: dict) -> Habit:
    """Persist a new habit record."""
    # Build and save the habit instance
    new_habit = Habit(**habit_data)
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit


def get_habits_by_user(db: Session, user_id: int) -> list[Habit]:
    """Return all habits for the given user."""
    return db.query(Habit).filter(Habit.user_id == user_id).all()


def get_habit_by_id(db: Session, habit_id: int) -> Habit | None:
    """Fetch a habit by its primary key."""
    return db.query(Habit).filter(Habit.id == habit_id).first()


def log_habit(db: Session, habit_id: int) -> Habit | None:
    """Record one completion of the habit and update its streak."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if habit:
        # Increment the streak and update the last_logged timestamp
        habit.streak_count += 1
        habit.last_logged = datetime.utcnow()
        db.commit()
        db.refresh(habit)
    return habit


def delete_habit(db: Session, habit_id: int) -> None:
    """Remove a habit from the database."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if habit:
        db.delete(habit)
        db.commit()
