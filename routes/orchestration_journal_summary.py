"""Route providing orchestrated journal entry summarization."""

from __future__ import annotations

# Notes: FastAPI router utilities and dependencies
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Notes: Dependency helpers for authentication and DB access
from auth.dependencies import get_current_user
from database.utils import get_db

# Notes: User model for dependency typing
from models.user import User

# Notes: Import the summarization service
from services.orchestration_summarizer import summarize_journal_entries

# Notes: Feature flag controlling access to this route
import os

ORCHESTRATION_FEATURE_ENABLED = os.getenv("ORCHESTRATION_FEATURE", "false").lower() == "true"

router = APIRouter(prefix="/orchestration", tags=["orchestration"])


@router.post("/journal-summary")
# Notes: Endpoint returning a summary of the latest journal entries
def journal_summary_route(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return summarized text generated from the user's journals."""

    # Notes: Ensure the feature flag is enabled and requester is an admin
    if not ORCHESTRATION_FEATURE_ENABLED or current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Feature disabled")

    user_id = payload.get("user_id")
    if not user_id or int(user_id) != current_user.id:
        raise HTTPException(status_code=403, detail="Invalid user context")

    # Notes: Delegate to service layer to produce the summary
    summary = summarize_journal_entries(user_id, db)

    # Notes: Return the summary string to the client
    return {"summary": summary}

# Footnote: This route will later be opened to all users when the feature matures.
