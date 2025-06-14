from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service, journal_service
from schemas.journal_schemas import JournalEntryCreate, JournalEntryResponse
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/journals", tags=["journals"])


@router.post("/", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_data: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalEntryResponse:
    user = user_service.get_user(db, entry_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_entry = journal_service.create_journal_entry(db, entry_data.model_dump())
    return new_entry


@router.get("/{entry_id}", response_model=JournalEntryResponse)
def read_journal_entry(entry_id: int, db: Session = Depends(get_db)) -> JournalEntryResponse:
    entry = journal_service.get_journal_entry_by_id(db, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
    return entry


@router.get("/user/{user_id}", response_model=list[JournalEntryResponse])
def read_journal_entries_by_user(user_id: int, db: Session = Depends(get_db)) -> list[JournalEntryResponse]:
    entries = journal_service.get_journal_entries_by_user(db, user_id)
    return entries
