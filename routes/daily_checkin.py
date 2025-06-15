from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service, daily_checkin_service
from schemas.daily_checkin_schemas import DailyCheckInCreate, DailyCheckInResponse
from utils.logger import get_logger
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/daily-checkins", tags=["daily-checkins"])

logger = get_logger()


@router.post("/", response_model=DailyCheckInResponse, status_code=status.HTTP_201_CREATED)
def create_daily_checkin(
    checkin_data: DailyCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyCheckInResponse:
    logger.info("Creating daily check-in for user_id: %s", current_user.id)
    user = user_service.get_user(db, checkin_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_checkin = daily_checkin_service.create_daily_checkin(db, checkin_data.model_dump())
    return new_checkin


@router.get("/{checkin_id}", response_model=DailyCheckInResponse)
def read_daily_checkin(checkin_id: int, db: Session = Depends(get_db)) -> DailyCheckInResponse:
    logger.info("Fetching daily check-in with ID: %s", checkin_id)
    checkin = daily_checkin_service.get_daily_checkin_by_id(db, checkin_id)
    if checkin is None:
        logger.warning("Daily check-in not found with ID: %s", checkin_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily check-in not found")
    return checkin


@router.get("/user/{user_id}", response_model=list[DailyCheckInResponse])
def read_daily_checkins_by_user(user_id: int, db: Session = Depends(get_db)) -> list[DailyCheckInResponse]:
    logger.info("Fetching all daily check-ins for user_id: %s", user_id)
    checkins = daily_checkin_service.get_daily_checkins_by_user(db, user_id)
    return checkins
