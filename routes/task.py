"""Routes for managing user tasks."""

# Notes: Import FastAPI utilities for routing and dependencies
from fastapi import APIRouter, Depends, HTTPException, status

# Notes: SQLAlchemy session type for database interaction
from sqlalchemy.orm import Session

# Notes: Helper to obtain a database session
from database.utils import get_db

# Notes: Import services for task CRUD and user lookup
from services import task_service, user_service

# Notes: Schemas defining request and response models for tasks
from schemas.task_schemas import TaskCreate, TaskResponse

# Notes: Dependency that retrieves the currently authenticated user
from auth.dependencies import get_current_user

# Notes: SQLAlchemy model representing a user
from models.user import User

# Notes: Initialize the router for task endpoints
router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
# Notes: Create a new task for the specified user
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Persist a new task and return it."""
    # Notes: Ensure the user exists before creating the task
    user = user_service.get_user(db, task_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    # Notes: Delegate creation to the service layer
    new_task = task_service.create_task(db, task_data.model_dump())
    return new_task


@router.get("/user/{user_id}", response_model=list[TaskResponse])
# Notes: Retrieve all tasks belonging to a user
def read_tasks_by_user(user_id: int, db: Session = Depends(get_db)) -> list[TaskResponse]:
    """Return a list of tasks for the user."""
    # Notes: Fetch tasks from the service
    tasks = task_service.get_tasks_by_user(db, user_id)
    return tasks


@router.put("/{task_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
# Notes: Mark the specified task as completed
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Update the task to set its completion flag."""
    # Notes: Use the service layer to mark the task complete
    task_service.mark_task_complete(db, task_id)
    return None


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
# Notes: Delete a task by its identifier
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Remove the task from the database."""
    # Notes: Delegate deletion to the service layer
    task_service.delete_task(db, task_id)
    return None
