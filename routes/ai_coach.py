"""Routes exposing AI coach functionality."""

# Notes: Import FastAPI utilities for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException

# Notes: Import database session type for dependency injection
from sqlalchemy.orm import Session

# Notes: Helper to obtain a DB session within request lifecycle
from database.utils import get_db

# Notes: Service that generates responses using OpenAI
from services import ai_processor

# Notes: Dependency that retrieves the authenticated user
from auth.dependencies import get_current_user

# Notes: SQLAlchemy model representing application users
from models.user import User

# Notes: Initialize router for AI coach endpoints
router = APIRouter(prefix="/ai", tags=["ai-coach"])


@router.post("/coach")
# Notes: Endpoint to generate a coaching response from the AI
async def ai_coach(
    payload: dict,
    # Notes: Inject the authenticated user into the request context
    current_user: User = Depends(get_current_user),
    # Notes: Provide a database session in case it's needed later
    db: Session = Depends(get_db),
):
    """Return AI generated response for the given prompt."""
    # Notes: Extract prompt from request payload
    prompt = payload.get("prompt")
    if prompt is None:
        raise HTTPException(status_code=400, detail="Prompt is required")
    # Notes: Generate response from the AI processor service using the user's context
    ai_response = ai_processor.generate_ai_response(db, current_user.id, prompt)
    # Notes: Return the generated response in a JSON structure
    return {"response": ai_response}
