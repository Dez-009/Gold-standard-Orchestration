from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service, session_service
from schemas.session_schemas import SessionCreate, SessionResponse
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_200_OK)
def create_session(
    session_data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionResponse:
    user = user_service.get_user(db, session_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_session = session_service.create_session(db, session_data.model_dump())
    return new_session


@router.get("/{session_id}", response_model=SessionResponse)
def read_session(session_id: int, db: Session = Depends(get_db)) -> SessionResponse:
    session = session_service.get_session_by_id(db, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.get("/user/{user_id}", response_model=list[SessionResponse])
def read_sessions_by_user(user_id: int, db: Session = Depends(get_db)) -> list[SessionResponse]:
    sessions = session_service.get_sessions_by_user(db, user_id)
    return sessions
