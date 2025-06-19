"""Admin routes for listing agent assignments."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.agent_assignment_service import list_agent_assignments

router = APIRouter(prefix="/admin/agents", tags=["admin"])


@router.get("/")
def get_assignments(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all agent assignments with user emails."""
    return list_agent_assignments(db)

