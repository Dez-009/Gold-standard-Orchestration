from sqlalchemy.orm import Session
from datetime import datetime

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


def update_goal_progress(db: Session, goal_id: int, user_id: int, progress: int, target: int = None) -> Goal | None:
    """Update the progress of a goal for a specific user."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if goal is None:
        return None
    
    goal.progress = progress
    goal.progress_updated_at = datetime.utcnow()
    
    if target is not None:
        goal.target = target
    
    # Mark as completed if progress reaches or exceeds target
    if goal.target and goal.progress >= goal.target:
        goal.is_completed = True
    
    db.commit()
    db.refresh(goal)
    return goal


def get_goals_with_progress(db: Session, user_id: int) -> list[dict]:
    """Return goals with progress information for a user."""
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    
    return [
        {
            "id": goal.id,
            "title": goal.title,
            "target": goal.target,
            "progress": goal.progress,
            "updated_at": goal.progress_updated_at.isoformat() if goal.progress_updated_at else goal.updated_at.isoformat(),
            "is_completed": goal.is_completed
        }
        for goal in goals
    ]
