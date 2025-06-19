"""Schema returned by the journal summary endpoint."""

# Notes: Import BaseModel from Pydantic for response validation
from pydantic import BaseModel


class JournalSummaryResponse(BaseModel):
    """Model describing the AI-generated journal summary."""

    summary: str
    # Notes: Number of retries performed when generating the summary
    retry_count: int = 0
    # Notes: Whether the call exceeded the timeout threshold
    timeout_occurred: bool = False
