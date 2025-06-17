"""Route handling multi-agent orchestration requests."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Notes: Import authentication and database utilities
from auth.dependencies import get_current_user
from database.utils import get_db

# Notes: Import the user model for dependency typing
from models.user import User

# Notes: Import schema classes for request and response models
from schemas.ai_orchestration import (
    AIOrchestrationRequest,
    AIOrchestrationResponse,
)

# Notes: Import the processor service that coordinates agents
from services.orchestration_processor_service import process_user_prompt

router = APIRouter(prefix="/ai", tags=["ai-orchestration"])


@router.post("/orchestration", response_model=AIOrchestrationResponse)
# Notes: Endpoint that processes a prompt using all assigned agents
async def orchestration_endpoint(
    payload: AIOrchestrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AIOrchestrationResponse:
    """Return aggregated responses from the user's assigned agents."""

    # Notes: Ensure the user_id belongs to the authenticated user
    if payload.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Invalid user context")

    # Notes: Delegate to the processor service to gather agent replies
    results = process_user_prompt(db, payload.user_id, payload.user_prompt)

    # Notes: Return the list of responses in the response model
    return AIOrchestrationResponse(responses=results)
