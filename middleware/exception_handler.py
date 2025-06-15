from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from utils.logger import get_logger


def init_exception_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the FastAPI app."""
    logger = get_logger()

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception occurred")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal Server Error"},
        )
