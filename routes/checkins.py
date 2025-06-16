"""Routes exposing health check-in CRUD operations."""

# Notes: Import FastAPI helpers for routing and dependency injection
from fastapi import APIRouter, Depends, status
# Notes: SQLAlchemy session class used for database access
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from models.user import User
from database.utils import get_db
from schemas.daily_checkin_schemas import DailyCheckInCreate, DailyCheckInResponse
from services import daily_checkin_service

# Notes: Initialize an API router with the desired URL prefix
router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.post("/", response_model=DailyCheckInResponse, status_code=status.HTTP_201_CREATED)
def submit_checkin(
    checkin: DailyCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyCheckInResponse:
    """Persist a new health check-in for the authenticated user."""

    # Notes: Delegate persistence to the service layer
    new_checkin = daily_checkin_service.create_checkin(
        db,
        user_id=current_user.id,
        mood=checkin.mood.value if hasattr(checkin.mood, "value") else checkin.mood,
        energy_level=checkin.energy_level,
        stress_level=checkin.stress_level,
        notes=checkin.notes,
    )
    # Notes: Convert the ORM model into a response schema
    return DailyCheckInResponse.model_validate(new_checkin, from_attributes=True)


@router.get("/", response_model=list[DailyCheckInResponse])
def read_checkins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DailyCheckInResponse]:
    """Return all check-ins for the current user."""

    # Notes: Retrieve all check-ins belonging to the authenticated user
    checkins = daily_checkin_service.get_checkins(db, current_user.id)
    # Notes: Transform ORM objects into response schemas
    return [DailyCheckInResponse.model_validate(c, from_attributes=True) for c in checkins]
