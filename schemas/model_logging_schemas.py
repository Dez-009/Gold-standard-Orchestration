"""Pydantic schemas describing model log entries returned to admins."""

from datetime import datetime
from pydantic import BaseModel


class ModelLogEntry(BaseModel):
    """Single AI model request log record."""

    # Notes: When the request was issued
    timestamp: datetime
    # Notes: ID of the user who made the request
    user_id: int
    # Notes: Name of the provider such as OpenAI or Claude
    provider: str
    # Notes: Underlying model name used for the request
    model_name: str
    # Notes: Total number of tokens consumed
    tokens_used: int
    # Notes: Time taken for the request in milliseconds
    latency_ms: int

    class Config:
        orm_mode = True
