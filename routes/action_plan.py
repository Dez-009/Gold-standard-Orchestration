"""Routes for generating action plans for user goals."""

# Notes: Import FastAPI utilities for routing and dependency injection
from fastapi import APIRouter, Depends

# Notes: Import SQLAlchemy Session type for database operations
from sqlalchemy.orm import Session

# Notes: Helper to obtain a database session
from database.utils import get_db

# Notes: Service layer function that creates an action plan
from services.action_plan_service import generate_action_plan

# Notes: Dependency that retrieves the currently authenticated user
from auth.dependencies import get_current_user

# Notes: SQLAlchemy model representing a user in the database
from models.user import User

# Notes: BaseModel from Pydantic for request validation
from pydantic import BaseModel


# Notes: Schema describing the expected request body when generating an action plan
class ActionPlanRequest(BaseModel):
    goal: str


# Notes: Initialize the router for action-plan endpoints
router = APIRouter(prefix="/action-plan", tags=["action-plan"])


@router.post("/generate")
# Notes: Endpoint that returns an action plan for a user's goal
async def generate_action_plan_endpoint(
    request: ActionPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personalized action plan using the service layer."""
    # Notes: Delegate to the service to create an action plan based on the goal
    action_plan = generate_action_plan(db, current_user.id, request.goal)
    # Notes: Return the generated action plan in JSON format
    return {"action_plan": action_plan}
