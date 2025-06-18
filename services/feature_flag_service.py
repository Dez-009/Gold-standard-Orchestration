from __future__ import annotations

from sqlalchemy.orm import Session

from models.feature_flag import FeatureFlag, AccessTier


_ROLE_ORDER = {
    "free": 0,
    "plus": 1,
    "pro": 2,
    "admin": 3,
}


def get_feature_flag(db: Session, feature_key: str, user_role: str) -> bool:
    """Return True if ``feature_key`` is enabled for ``user_role``."""

    flag = db.query(FeatureFlag).filter(FeatureFlag.feature_key == feature_key).first()
    if flag is None:
        # Missing flag defaults to enabled
        return True
    required = _ROLE_ORDER.get(flag.access_tier.value, 0)
    actual = _ROLE_ORDER.get(user_role, 0)
    if actual < required:
        return False
    return bool(flag.enabled)


def set_feature_flag(
    db: Session, feature_key: str, tier: str | AccessTier, enabled: bool
) -> FeatureFlag:
    """Create or update a feature flag record."""

    tier_enum = AccessTier(tier) if not isinstance(tier, AccessTier) else tier
    flag = db.query(FeatureFlag).filter(FeatureFlag.feature_key == feature_key).first()
    if flag:
        flag.access_tier = tier_enum
        flag.enabled = enabled
    else:
        flag = FeatureFlag(feature_key=feature_key, access_tier=tier_enum, enabled=enabled)
        db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag


def list_feature_flags(db: Session) -> list[FeatureFlag]:
    """Return all feature flags ordered by key."""

    return db.query(FeatureFlag).order_by(FeatureFlag.feature_key).all()


# Footnote: Service for manipulating feature flags with role checks.
