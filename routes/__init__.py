from fastapi import APIRouter

from .vida import router as vida_router
from .user import router as user_router
from .auth import router as auth_router
from .protected import router as protected_router
from .session import router as session_router
from .journal import router as journal_router
from .notification import router as notification_router
from .goal import router as goal_router

router = APIRouter()

router.include_router(vida_router)
router.include_router(user_router)
router.include_router(auth_router)
router.include_router(protected_router)
router.include_router(session_router)
router.include_router(journal_router)
router.include_router(notification_router)
router.include_router(goal_router)

