from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address


def _custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Too Many Requests"},
    )


limiter = Limiter(key_func=get_remote_address, default_limits=["100/10minute"])


def init_rate_limiter(app: FastAPI, default_limit: str | None = None) -> None:
    """Initialize the rate limiting middleware."""
    if default_limit:
        limiter.default_limits = [default_limit]
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _custom_rate_limit_handler)
    app.add_middleware(SlowAPIMiddleware)
    # ``slowapi.Limiter`` does not expose ``init_app`` in the installed version
    # so simply attaching the middleware is sufficient

