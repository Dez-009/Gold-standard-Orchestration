# Notes: Import necessary modules for Pydantic models and typing
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Notes: Schema for creating a new task
class TaskCreate(BaseModel):
    """Model for creating a task."""

    # Identifier of the user that owns the task
    user_id: int
    # Text description of the task
    description: str
    # Optional due date for the task completion
    due_date: Optional[datetime] = None


# Notes: Schema representing a task returned from the API
class TaskResponse(BaseModel):
    """Model for returning task information."""

    # Identifier of the user that owns the task
    user_id: int
    # Unique identifier of the task
    id: int
    # Description text of the task
    description: str
    # Flag indicating whether the task has been completed
    is_completed: bool
    # Optional due date associated with the task
    due_date: Optional[datetime] = None
    # Timestamp when the task was created
    created_at: datetime

    class Config:
        # Notes: Enable compatibility with ORM objects
        orm_mode = True
