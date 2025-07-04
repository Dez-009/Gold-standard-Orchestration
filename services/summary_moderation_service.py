from __future__ import annotations
"""Helpers for moderation checks on generated summaries."""

from openai import OpenAI, OpenAIError
from config import get_settings
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID

from services import audit_log_service
from utils.logger import get_logger
from models.summarized_journal import SummarizedJournal
from models.journal_summary import JournalSummary
from . import agent_flag_service

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)
logger = get_logger()


def _moderation_flagged(text: str) -> bool:
    """Return True when text fails the moderation check."""
    try:
        resp = client.moderations.create(input=text)
        return bool(resp.results[0].flagged)
    except OpenAIError as exc:  # pragma: no cover - network may be disabled
        logger.warning("moderation check failed: %s", exc)
    except Exception as exc:  # pragma: no cover - network may be disabled
        logger.warning("moderation error: %s", exc)
    # Simple keyword heuristic fallback
    lowered = text.lower()
    return any(word in lowered for word in ["forbidden", "banned", "violence"])


def flag_summary_if_needed(db: Session, summary: SummarizedJournal | JournalSummary, user_id: int) -> None:
    """Create an AgentOutputFlag when the summary text is unsafe."""
    if _moderation_flagged(summary.summary_text):
        reason = "moderation_violation"
        agent_flag_service.flag_agent_output(
            db,
            "JournalSummarizationAgent",
            user_id,
            reason,
            summary_id=summary.id,
        )
        # Notes: Persist flag details directly on the summary record
        summary.flagged = True
        summary.flag_reason = reason
        summary.flagged_at = datetime.utcnow()
        db.commit()


def auto_flag_summary(db: Session, summary_id: UUID, content: str) -> tuple[bool, str]:
    """Run heuristic checks and flag the summary when issues are detected."""

    lowered = content.lower()
    trigger_type = None
    if any(word in lowered for word in ["suicide", "kill", "hate"]):
        trigger_type = "keyword"
    elif _moderation_flagged(content):
        trigger_type = "ai_moderation"

    flagged = trigger_type is not None

    # Notes: use session.get over deprecated Query.get
    summary = db.get(SummarizedJournal, summary_id)
    if summary is None:
        return False, "none"

    if flagged:
        summary.flagged = True
        summary.flag_reason = f"Auto-flagged: {trigger_type}"
        summary.flagged_at = datetime.utcnow()
        db.commit()
        audit_log_service.log_event(
            db,
            summary_id,
            "auto_flag",
            {"user_id": summary.user_id, "reason": trigger_type},
        )
    else:
        audit_log_service.log_event(
            db,
            summary_id,
            "auto_flag_review",
            {"user_id": summary.user_id, "reason": "manual_review"},
        )

    return flagged, trigger_type or "manual_review"


