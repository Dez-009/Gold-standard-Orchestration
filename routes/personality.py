# Notes: FastAPI utilities for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Notes: Helper to access a database session
from database.utils import get_db
# Notes: Service layer with CRUD helpers
from services import personality_service
# Notes: Request and response schemas
from schemas.personality_schemas import PersonalityCreate, PersonalityResponse
# Notes: Reuse existing authentication dependency
from auth.dependencies import get_current_user
# Notes: User model used to enforce authentication
from models.user import User


router = APIRouter(prefix="/personalities", tags=["personalities"])


@router.post("/", response_model=PersonalityResponse, status_code=status.HTTP_201_CREATED)
# Notes: Endpoint for administrators to add new personalities
def create_personality(
    personality_data: PersonalityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PersonalityResponse:
    """Create a new personality record."""
    # Notes: Only allow admins in a real app (skipped here)
    new_personality = personality_service.create_personality(
        db, personality_data.model_dump()
    )
    return new_personality


@router.get("/", response_model=list[PersonalityResponse])
# Notes: List all available personalities
def read_personalities(db: Session = Depends(get_db)) -> list[PersonalityResponse]:
    """Return every Personality in the system."""
    personalities = personality_service.get_all_personalities(db)
    return personalities

