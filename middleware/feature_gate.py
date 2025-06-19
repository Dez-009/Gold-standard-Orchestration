from __future__ import annotations

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.utils import get_db
from services import feature_flag_service
from models.user import User


def feature_gate(feature_key: str):
    """Return a dependency enforcing the feature flag for ``feature_key``."""

    async def _gate(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> None:
        allowed = feature_flag_service.get_feature_flag(db, feature_key, user.role)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="FeatureDisabled",
            )

    return _gate


# Footnote: Dependency for protecting feature-specific routes.
