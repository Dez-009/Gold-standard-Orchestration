"""Admin route for querying the rule-based admin agent."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.admin_agent_service import process_admin_query

# Notes: Expose endpoints under the /admin prefix with admin tag
router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/agent-query")
def admin_agent_query(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return the admin agent's answer for the provided prompt."""
    user_prompt = payload.get("user_prompt", "")
    return process_admin_query(user_prompt, db)
