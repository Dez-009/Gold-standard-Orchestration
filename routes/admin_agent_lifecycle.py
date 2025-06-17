"""Admin endpoints for viewing agent lifecycle logs."""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.agent_lifecycle_service import list_agent_events

# Notes: Router prefix matches other admin endpoints
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/agent-lifecycle-logs")
def get_agent_lifecycle_logs(
    agent_name: str | None = None,
    event_type: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return lifecycle logs filtered by agent, type and date range."""

    # Notes: Parse date strings if provided
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    # Notes: Fetch records from the service layer
    logs = list_agent_events(db, agent_name, event_type, start, end, limit, offset)

    # Notes: Convert ORM objects to dictionaries for JSON response
    results: list[dict] = []
    for log in logs:
        results.append(
            {
                "id": str(log.id),
                "user_id": log.user_id,
                "agent_name": log.agent_name,
                "event_type": log.event_type,
                "timestamp": log.timestamp.isoformat(),
                "details": log.details,
            }
        )
    return results
