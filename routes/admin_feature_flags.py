"""Admin routes for managing feature flags."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import feature_flag_service

router = APIRouter(prefix="/admin/feature-flags", tags=["admin"])


@router.get("/")
def list_flags(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return all feature flag records."""

    rows = feature_flag_service.list_feature_flags(db)
    return [
        {
            "feature_key": r.feature_key,
            "access_tier": r.access_tier.value,
            "enabled": r.enabled,
            "updated_at": r.updated_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/update")
def update_flag(
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Create or update a feature flag."""

    feature_key = payload.get("feature_key")
    tier = payload.get("access_tier")
    enabled = payload.get("enabled")
    if feature_key is None or tier is None or enabled is None:
        raise HTTPException(status_code=400, detail="Missing parameters")
    flag = feature_flag_service.set_feature_flag(db, feature_key, tier, bool(enabled))
    return {
        "feature_key": flag.feature_key,
        "access_tier": flag.access_tier.value,
        "enabled": flag.enabled,
        "updated_at": flag.updated_at.isoformat(),
    }


@router.delete("/{feature_key}")
def deactivate_flag(
    feature_key: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Disable a feature flag entirely."""

    flag = feature_flag_service.set_feature_flag(db, feature_key, "admin", False)
    return {
        "feature_key": flag.feature_key,
        "access_tier": flag.access_tier.value,
        "enabled": flag.enabled,
    }


# Footnote: Admin API exposing CRUD operations for feature flags.
