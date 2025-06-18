"""Service layer for reading and writing admin notes on summaries."""

from __future__ import annotations

from typing import List, Dict
from uuid import UUID

from sqlalchemy.orm import Session

from models.admin_summary_note import AdminSummaryNote
from services.audit_log_service import create_audit_log


def get_notes_timeline(db: Session, summary_id: UUID | str) -> List[Dict]:
    """Return all notes associated with the given summary ordered newest first."""

    sid = UUID(str(summary_id)) if not isinstance(summary_id, UUID) else summary_id
    rows = (
        db.query(AdminSummaryNote)
        .filter(AdminSummaryNote.summary_id == sid)
        .order_by(AdminSummaryNote.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(r.id),
            "author_id": r.author_id,
            "content": r.content,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


def add_note(db: Session, summary_id: UUID | str, author_id: int, content: str) -> Dict:
    """Append a note to the summary and log the action."""

    if not content:
        raise ValueError("content required")

    sid = UUID(str(summary_id)) if not isinstance(summary_id, UUID) else summary_id
    note = AdminSummaryNote(summary_id=sid, author_id=author_id, content=content)
    db.add(note)
    db.commit()
    db.refresh(note)

    create_audit_log(
        db,
        {
            "user_id": author_id,
            "action": "ADMIN_NOTE",
            "detail": f"summary:{sid}",
        },
    )

    return {
        "id": str(note.id),
        "author_id": note.author_id,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
    }
