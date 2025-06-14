from sqlalchemy.orm import Session

from models.goal import Goal


def create_goal(db: Session, goal_data: dict) -> Goal:
    """Create a new goal and persist it."""
    new_goal = Goal(**goal_data)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal


def get_goal_by_id(db: Session, goal_id: int) -> Goal | None:
    """Return a goal by its ID or None if not found."""
    return db.query(Goal).filter(Goal.id == goal_id).first()


def get_goals_by_user(db: Session, user_id: int) -> list[Goal]:
    """Return all goals for a specific user."""
    return db.query(Goal).filter(Goal.user_id == user_id).all()
