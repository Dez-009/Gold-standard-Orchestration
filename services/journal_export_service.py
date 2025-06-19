# Notes: Import binary stream, PDF creation library and FastAPI response
from io import BytesIO
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas

# Notes: Import the ORM model representing journal entries
from models.journal_entry import JournalEntry


# Notes: Generate a PDF for all journals belonging to the specified user
# Returns a StreamingResponse that can be returned directly from a route

def generate_journal_pdf(user_id: int, db: Session) -> StreamingResponse:
    """Create a PDF document containing the user's journal entries."""
    # Notes: Retrieve the user's journal entries ordered by creation date
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at)
        .all()
    )

    # Notes: Allocate a bytes buffer and set up the PDF canvas
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=LETTER)
    text = pdf.beginText(40, 750)
    text.setFont("Helvetica", 12)

    # Notes: Title heading for the document
    text.textLine("User Journals")
    text.textLine("")

    # Notes: Write each journal entry's details into the PDF
    for entry in entries:
        created = entry.created_at.strftime("%Y-%m-%d %H:%M")
        title = entry.title or "Untitled"
        text.textLine(f"{title} ({created})")
        text.textLine(entry.content)
        text.textLine("")

    # Notes: Finalize the PDF and reset buffer position for streaming
    pdf.drawText(text)
    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    # Notes: Return a streaming response with appropriate content type
    headers = {"Content-Disposition": "attachment; filename=journals.pdf"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
