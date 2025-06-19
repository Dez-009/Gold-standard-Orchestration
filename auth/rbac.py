"""Role-based access control utilities."""

from __future__ import annotations

from typing import Callable, Iterable

from fastapi import Depends, HTTPException, status

from auth.dependencies import get_current_user
from models.user import User

# Hierarchical role ordering
_ROLE_LEVEL = {
    "guest": 0,
    "user": 1,
    "coach": 2,
    "admin": 3,
}


def require_role(roles: Iterable[str]):
    """Endpoint decorator enforcing membership in ``roles``."""

    def decorator(func: Callable):
        async def wrapper(
            *args,
            user: User = Depends(get_current_user),
            **kwargs,
        ):
            level = _ROLE_LEVEL.get(user.role or "guest", 0)
            min_required = min(_ROLE_LEVEL.get(r, 0) for r in roles)
            if level < min_required:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
            return await func(*args, **kwargs)

        return wrapper

    return decorator
