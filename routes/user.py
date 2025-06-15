from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service
from schemas.user_schemas import UserCreate, UserResponse
from utils.logger import get_logger

router = APIRouter(prefix="/users", tags=["users"])

logger = get_logger()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    logger.info("Registering new user with email: %s", user.email)
    existing_user = user_service.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )
    new_user = user_service.create_user(db, user.model_dump())
    return new_user


@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    logger.info("Fetching user with ID: %s", user_id)
    db_user = user_service.get_user(db, user_id)
    if db_user is None:
        logger.warning("User not found with ID: %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return db_user
