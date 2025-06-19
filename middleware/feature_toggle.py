"""Middleware that blocks requests when a feature flag is disabled."""

from __future__ import annotations

from typing import Callable
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from config.feature_flags import is_feature_enabled
from utils.logger import get_logger

logger = get_logger()


async def feature_toggle_middleware(request: Request, call_next: Callable):
    """Reject requests for disabled features."""
    segment = request.url.path.split("/", 2)[1]
    feature_map = {
        "journals": "journals",
        "pdf-export": "pdf_export",
        "device-sync": "device_sync",
    }
    feature = feature_map.get(segment)
    if feature and not is_feature_enabled(feature):
        logger.info("Blocked access to disabled feature %s", feature)
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "FeatureDisabled"},
        )
    return await call_next(request)


def init_feature_toggle(app: FastAPI) -> None:
    """Attach the feature toggle middleware to the app."""
    app.middleware("http")(feature_toggle_middleware)
