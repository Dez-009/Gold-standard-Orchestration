"""Routes exposing runtime configuration such as enabled features."""

from fastapi import APIRouter, Depends

from auth.dependencies import get_current_user
from models.user import User
from config import get_settings

router = APIRouter(prefix="/settings", tags=["settings"])

# Notes: Load settings once so the list can be returned quickly
settings = get_settings()


@router.get("/enabled-features")
def read_enabled_features(_: User = Depends(get_current_user)) -> dict:
    """Return the list of features enabled for this deployment."""

    return {"enabled_features": settings.ENABLED_FEATURES}

# Footnote: Provides read-only access to deployment configuration.
