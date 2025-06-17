# Notes: Pydantic models for journal tag extraction responses
from pydantic import BaseModel


class JournalTagsResponse(BaseModel):
    """Schema returned when journal tags are analyzed."""

    # Notes: List of keywords or tags extracted from the journals
    tags: list[str]
