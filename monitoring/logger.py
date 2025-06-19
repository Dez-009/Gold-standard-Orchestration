"""Wrapper module standardizing application logging."""

from __future__ import annotations

import logging
from typing import Any, Dict

from utils.logger import get_logger as _get_base_logger


logger = _get_base_logger()


def log_performance(metric: str, value: float, metadata: Dict[str, Any] | None = None) -> None:
    """Record a performance metric with structured metadata."""

    logger.info("PERF %s=%s metadata=%s", metric, value, metadata or {})


def log_error(msg: str, **metadata: Any) -> None:
    """Record an error with additional metadata."""

    logger.error("%s metadata=%s", msg, metadata)
