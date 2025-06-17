"""Schema returned by the journal summary endpoint."""

# Notes: Import BaseModel from Pydantic for response validation
from pydantic import BaseModel


class JournalSummaryResponse(BaseModel):
    """Model describing the AI-generated journal summary."""

    summary: str
