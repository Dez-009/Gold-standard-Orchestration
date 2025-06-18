"""Admin endpoints for modifying enabled features at runtime."""

from fastapi import APIRouter, Depends, HTTPException, status

from auth.dependencies import get_current_admin_user
from models.user import User
from config import get_settings

router = APIRouter(prefix="/admin/features", tags=["admin"])

# Notes: Retrieve the singleton settings object
settings = get_settings()


@router.get("/")
def list_features(_: User = Depends(get_current_admin_user)) -> dict:
    """Return the current list of enabled features."""

    return {"features": settings.ENABLED_FEATURES}


@router.post("/")
def update_features(payload: dict, _: User = Depends(get_current_admin_user)) -> dict:
    """Update the enabled features when allowed by configuration."""

    if not settings.ALLOW_FEATURE_TOGGLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Feature toggling disabled",
        )
    features = payload.get("features")
    if not isinstance(features, list):
        raise HTTPException(status_code=400, detail="Invalid payload")
    settings.ENABLED_FEATURES = [str(f) for f in features]
    return {"features": settings.ENABLED_FEATURES}

# Footnote: Runtime API for managing deployment features.
