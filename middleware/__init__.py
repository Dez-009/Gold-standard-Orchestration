from .rate_limiter import init_rate_limiter


def init_middlewares(app):
    """Initialize all middleware components for the FastAPI app."""
    init_rate_limiter(app)


__all__ = ["init_middlewares"]
