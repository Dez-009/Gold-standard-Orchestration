from sqlalchemy.orm import Session

from models.task import Task


def create_task(db: Session, task_data: dict) -> Task:
    """Create a new task and persist it."""
    # Build the task instance from the provided dictionary
    new_task = Task(**task_data)
    # Persist the new task in the database
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    # Return the freshly created task
    return new_task


def get_tasks_by_user(db: Session, user_id: int) -> list[Task]:
    """Return all tasks for a specific user."""
    # Retrieve tasks that belong to the given user
    return db.query(Task).filter(Task.user_id == user_id).all()


def mark_task_complete(db: Session, task_id: int) -> None:
    """Mark the specified task as completed."""
    # Lookup the task by its identifier
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        # Update the completion flag and persist the change
        task.is_completed = True
        db.commit()


def delete_task(db: Session, task_id: int) -> None:
    """Remove a task from the database."""
    # Find the task record to delete
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        # Delete and commit the removal
        db.delete(task)
        db.commit()
