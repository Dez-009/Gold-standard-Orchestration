"""Admin route for viewing recent AI model usage logs."""

from fastapi import APIRouter, Depends
from auth.dependencies import get_current_admin_user
from models.user import User

from services.model_logging_service import get_model_logs
from schemas.model_logging_schemas import ModelLogEntry


# Notes: Prefix groups the endpoint under /admin/model-logs
router = APIRouter(prefix="/admin/model-logs", tags=["admin"])


@router.get("/", response_model=list[ModelLogEntry])
def list_model_logs(_: User = Depends(get_current_admin_user)) -> list[dict]:
    """Return the most recent AI model request logs."""
    # Notes: For now the service returns mocked data
    return get_model_logs()
