"""Pipeline helpers for post-processing generated summaries."""

from __future__ import annotations

from sqlalchemy.orm import Session

from models.summarized_journal import SummarizedJournal
from services import summary_moderation_service, orchestration_log_service


def handle_summary_moderation(db: Session, summary: SummarizedJournal) -> None:
    """Run auto-flagging on the summary and log the result."""

    flagged, trigger = summary_moderation_service.auto_flag_summary(
        db, summary.id, summary.summary_text
    )
    orchestration_log_service.log_agent_run(
        db,
        "JournalSummarizationAgent",
        summary.user_id,
        {
            "execution_time_ms": 0,
            "input_tokens": len(summary.summary_text),
            "output_tokens": len(summary.summary_text),
            "status": "auto_flagged" if flagged else "completed",
            "fallback_triggered": False,
            "timeout_occurred": False,
            "retries": 0,
            "error_message": None,
            "moderation_triggered": flagged,
            "trigger_type": trigger,
        },
    )
