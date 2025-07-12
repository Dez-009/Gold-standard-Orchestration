from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class GoalCreate(BaseModel):
    user_id: int
    title: str
    description: Optional[str] = None
    target: Optional[int] = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    is_completed: bool
    target: Optional[int] = None
    progress: int = 0
    progress_updated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoalProgressUpdate(BaseModel):
    progress: int
    target: Optional[int] = None


class GoalProgressResponse(BaseModel):
    id: int
    title: str
    target: Optional[int] = None
    progress: int
    updated_at: str
    is_completed: bool
