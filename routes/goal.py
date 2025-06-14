from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service, goal_service
from schemas.goal_schemas import GoalCreate, GoalResponse
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalResponse:
    user = user_service.get_user(db, goal_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_goal = goal_service.create_goal(db, goal_data.model_dump())
    return new_goal


@router.get("/{goal_id}", response_model=GoalResponse)
def read_goal(goal_id: int, db: Session = Depends(get_db)) -> GoalResponse:
    goal = goal_service.get_goal_by_id(db, goal_id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.get("/user/{user_id}", response_model=list[GoalResponse])
def read_goals_by_user(user_id: int, db: Session = Depends(get_db)) -> list[GoalResponse]:
    goals = goal_service.get_goals_by_user(db, user_id)
    return goals
