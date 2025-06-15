"""API routes for habit management."""

# Notes: Import FastAPI utilities and dependencies
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Notes: Utility to obtain DB session and service layers
from database.utils import get_db
from services import habit_service, user_service
from schemas.habit_schemas import HabitCreate, HabitResponse
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/habits", tags=["habits"])


@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
# Notes: Create a new habit for the authenticated user
def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    # Verify the referenced user exists
    user = user_service.get_user(db, habit_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_habit = habit_service.create_habit(db, habit_data.model_dump())
    return new_habit


@router.get("/user/{user_id}", response_model=list[HabitResponse])
# Notes: Retrieve all habits for the specified user
def read_habits_by_user(user_id: int, db: Session = Depends(get_db)) -> list[HabitResponse]:
    habits = habit_service.get_habits_by_user(db, user_id)
    return habits


@router.put("/{habit_id}/log", response_model=HabitResponse)
# Notes: Increment the streak count for a habit
def log_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    habit = habit_service.log_habit(db, habit_id)
    if habit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
# Notes: Delete a habit record by its ID
def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    habit_service.delete_habit(db, habit_id)
    return None
