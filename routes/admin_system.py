"""Administrative endpoints exposing system debug status."""

from fastapi import APIRouter, Depends

from auth.dependencies import get_current_admin_user
from config import get_settings
from models.user import User

# Notes: Instantiate router with /admin/system prefix
router = APIRouter(prefix="/admin/system", tags=["admin"])

# Notes: Load application settings once for easy access
settings = get_settings()


@router.get("/debug-status")
def debug_status(_: User = Depends(get_current_admin_user)) -> dict:
    """Return whether debug banners should be shown in the admin UI."""
    # Notes: Reflect the DEBUG_MODE flag defined in configuration
    return {"debug": settings.DEBUG_MODE}
