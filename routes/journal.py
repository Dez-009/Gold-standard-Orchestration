from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.utils import get_db
from services import (
    user_service,
    journal_service,
    journal_export_service,
    journal_tagging_service,
    goal_service,
)
from schemas.journal_schemas import JournalEntryCreate, JournalEntryResponse
from schemas.journal_tagging_schemas import JournalTagsResponse
from auth.dependencies import get_current_user
from models.user import User
from middleware.feature_gate import feature_gate

router = APIRouter(
    prefix="/journals",
    tags=["journals"],
    dependencies=[Depends(feature_gate("journal"))],
)


@router.post("/", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_data: JournalEntryCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalEntryResponse:
    user = user_service.get_user(db, entry_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Notes: Validate that the linked goal belongs to the authenticated user
    if entry_data.linked_goal_id is not None:
        goal = goal_service.get_goal_by_id(db, entry_data.linked_goal_id)
        if goal is None or goal.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid goal for linking",
            )

    # Notes: Determine if the caller is allowed to set the ai_generated flag
    allowed_flag = (
        getattr(current_user, "role", "user") == "admin"
        or request.headers.get("X-Orchestrated") == "true"
    )
    # Notes: Inline comment for security and UX separation
    if entry_data.ai_generated and not allowed_flag:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to mark as AI-generated")

    new_entry = journal_service.create_journal_entry(db, entry_data.model_dump())
    return new_entry


# Notes: Export all journal entries for the authenticated user as a PDF
@router.get("/export")
def export_journals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """Return a PDF file containing the user's journal history."""
    return journal_export_service.generate_journal_pdf(current_user.id, db)


# Notes: Analyze all of the current user's journal entries and return key tags
@router.get("/analyze-tags", response_model=JournalTagsResponse)
def analyze_journal_tags(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalTagsResponse:
    """Return a list of keywords representing themes from the user's journals."""

    tags = journal_tagging_service.extract_tags_from_journals(db, current_user.id)
    return JournalTagsResponse(tags=tags)


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
