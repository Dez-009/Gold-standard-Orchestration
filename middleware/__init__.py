from .rate_limiter import init_rate_limiter
from .exception_handler import init_exception_handlers
from .session_tracker import init_session_tracker


def init_middlewares(app):
    """Initialize all middleware components for the FastAPI app."""
    init_rate_limiter(app)
    init_exception_handlers(app)
    init_session_tracker(app)


__all__ = ["init_middlewares"]
