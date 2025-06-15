from pydantic import BaseModel
from datetime import datetime


class AuditLogCreate(BaseModel):
    """Model for creating an audit log entry."""

    user_id: int
    action: str
    detail: str | None = None


class AuditLogResponse(BaseModel):
    """Model for returning audit log information."""

    id: int
    user_id: int
    action: str
    detail: str | None = None
    timestamp: datetime

    class Config:
        orm_mode = True
