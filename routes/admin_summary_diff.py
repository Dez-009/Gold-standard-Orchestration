from __future__ import annotations

"""Admin route exposing diff between journal summary versions."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.summarized_journal import SummarizedJournal
from models.user import User
from services.summary_diff_service import generate_summary_diff

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/summaries/{summary_id}/diff")
def summary_diff(
    summary_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return side-by-side diff for the specified summary."""

    sid = UUID(summary_id)
    summary = db.query(SummarizedJournal).get(sid)
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")

    diff_html = generate_summary_diff(sid)
    return {"summary_id": summary_id, "diff": diff_html}

