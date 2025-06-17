from __future__ import annotations

"""Service generating PDF exports for journal summaries."""

# Notes: Standard library imports
from io import BytesIO
from uuid import UUID

# Notes: Import database session factory and ORM models
from sqlalchemy.orm import Session
from database.session import SessionLocal
from models.journal_summary import JournalSummary
from models.user import User

# Notes: PDF generation library from reportlab
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas


def export_summary_to_pdf(summary_id: UUID) -> bytes:
    """Return a PDF document representing the journal summary."""

    # Notes: Allocate a DB session to load the summary and related user
    db: Session = SessionLocal()
    try:
        summary = db.query(JournalSummary).filter_by(id=summary_id).first()
        if summary is None:
            raise ValueError("Summary not found")
        user = db.query(User).filter_by(id=summary.user_id).first()

        # Notes: Set up a bytes buffer and PDF canvas
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=LETTER)
        text = pdf.beginText(40, 750)
        text.setFont("Helvetica", 12)

        # Notes: Document heading and basic info
        text.textLine("Journal Summary")
        text.textLine("")
        text.textLine(f"User: {user.email if user else summary.user_id}")
        text.textLine(f"Summary ID: {summary.id}")
        text.textLine("")

        # Notes: Main summary content from the AI system
        text.textLines(summary.summary_text)
        text.textLine("")

        # Notes: Placeholder metadata sections for tone, mood and tags
        text.textLine("Tone: N/A")
        text.textLine("Mood: N/A")
        text.textLine("Tags: N/A")

        # Notes: Finalize the PDF and reset buffer position
        pdf.drawText(text)
        pdf.showPage()
        pdf.save()
        buffer.seek(0)
        return buffer.read()
    finally:
        db.close()
