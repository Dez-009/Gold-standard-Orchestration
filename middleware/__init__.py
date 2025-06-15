from .rate_limiter import init_rate_limiter
from .exception_handler import init_exception_handlers


def init_middlewares(app):
    """Initialize all middleware components for the FastAPI app."""
    init_rate_limiter(app)
    init_exception_handlers(app)


__all__ = ["init_middlewares"]
