"""Route for downloading a journal summary as a PDF."""

from __future__ import annotations

# Notes: FastAPI dependencies and utilities
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from uuid import UUID

# Notes: Auth and DB helpers
from auth.dependencies import get_current_user
from database.utils import get_db

# Notes: ORM models and PDF service
from models.user import User
from models.journal_summary import JournalSummary
from services.pdf_export_service import export_summary_to_pdf

router = APIRouter(prefix="/summaries", tags=["summaries"])


@router.get("/{summary_id}/export-pdf")
def export_summary_pdf(
    summary_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    """Return a PDF file generated from the specified summary."""

    # Notes: Look up the summary record by id
    summary = db.query(JournalSummary).filter_by(id=summary_id).first()
    if summary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")

    # Notes: Only the owner or an admin is authorized to download
    if summary.user_id != current_user.id and getattr(current_user, "role", "user") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Notes: Generate the PDF bytes via the service layer
    pdf_bytes = export_summary_to_pdf(summary_id)
    headers = {"Content-Disposition": f"attachment; filename=summary_{summary_id}.pdf"}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

# Footnote: Allows users and admins to export summary documents.
