from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import goal_service, goal_refinement_service, user_service
from schemas.goal_schemas import GoalCreate, GoalResponse, GoalProgressUpdate, GoalProgressResponse
from schemas.goal_refinement_schemas import (
    GoalRefinementRequest,
    GoalRefinementResponse,
)
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


@router.get("/progress", response_model=list[GoalProgressResponse])
def get_goal_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[GoalProgressResponse]:
    """Get progress information for all goals of the current user."""
    goals_with_progress = goal_service.get_goals_with_progress(db, current_user.id)
    return goals_with_progress


@router.get("/user/{user_id}", response_model=list[GoalResponse])
def read_goals_by_user(user_id: int, db: Session = Depends(get_db)) -> list[GoalResponse]:
    goals = goal_service.get_goals_by_user(db, user_id)
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
def read_goal(goal_id: int, db: Session = Depends(get_db)) -> GoalResponse:
    goal = goal_service.get_goal_by_id(db, goal_id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.patch("/{goal_id}/progress", response_model=GoalProgressResponse)
def update_goal_progress(
    goal_id: int,
    progress_data: GoalProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalProgressResponse:
    """Update the progress of a specific goal."""
    updated_goal = goal_service.update_goal_progress(
        db, goal_id, current_user.id, progress_data.progress, progress_data.target
    )
    if updated_goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    
    return GoalProgressResponse(
        id=updated_goal.id,
        title=updated_goal.title,
        target=updated_goal.target,
        progress=updated_goal.progress,
        updated_at=updated_goal.progress_updated_at.isoformat() if updated_goal.progress_updated_at else updated_goal.updated_at.isoformat(),
        is_completed=updated_goal.is_completed
    )


# Notes: Endpoint that refines existing goals using journal context
@router.post("/suggest-refined", response_model=GoalRefinementResponse)
def suggest_refined_goals(
    payload: GoalRefinementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRefinementResponse:
    """Return improved versions of the user's goals."""

    refined = goal_refinement_service.refine_goals(
        current_user.id, payload.existing_goals, payload.journal_tags
    )
    return GoalRefinementResponse(refined_goals=refined)
