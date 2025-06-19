"""Admin routes for inspecting and processing agent failures."""

# Notes: FastAPI utilities for routing and dependencies
from fastapi import APIRouter, Depends
# Notes: SQLAlchemy session dependency
from sqlalchemy.orm import Session

# Notes: Ensure only admins may access these endpoints
from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
# Notes: Import service functions handling failures
from services import agent_failure_service

# Notes: Router configured under /admin prefix
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/agent-failures")
def list_agent_failures(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all queued agent failures."""

    entries = db.query(agent_failure_service.AgentFailureQueue).all()
    return [
        {
            "id": str(e.id),
            "user_id": e.user_id,
            "agent_name": e.agent_name,
            "failure_reason": e.failure_reason,
            "retry_count": e.retry_count,
            "max_retries": e.max_retries,
            "created_at": e.created_at.isoformat(),
            "updated_at": e.updated_at.isoformat(),
        }
        for e in entries
    ]


@router.post("/agent-failures/process")
def process_agent_failures(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Trigger processing of the failure queue."""

    agent_failure_service.process_failure_queue(db)
    return {"status": "processed"}
