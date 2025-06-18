"""Unit tests for flag reason analytics service."""

import os
import sys
from datetime import datetime, date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.flag_reason_analytics_service import get_flag_reason_usage
from models.summarized_journal import SummarizedJournal
from services import user_service
from tests.conftest import TestingSessionLocal


def _create_user(db):
    user = user_service.create_user(
        db,
        {
            "email": "fr@test.com",
            "phone_number": "1234567890",
            "hashed_password": "pw",
        },
    )
    return user.id


def test_flag_reason_usage_filters():
    db = TestingSessionLocal()
    uid = _create_user(db)
    s1 = SummarizedJournal(
        user_id=uid,
        summary_text="a",
        flagged=True,
        flag_reason="bad",
        flagged_at=datetime(2024, 1, 1, 0, 0, 0),
    )
    s2 = SummarizedJournal(
        user_id=uid,
        summary_text="b",
        flagged=True,
        flag_reason="bad",
        flagged_at=datetime(2024, 1, 3, 0, 0, 0),
    )
    s3 = SummarizedJournal(
        user_id=uid,
        summary_text="c",
        flagged=True,
        flag_reason="worse",
        flagged_at=datetime(2024, 1, 4, 0, 0, 0),
    )
    db.add_all([s1, s2, s3])
    db.commit()

    all_counts = get_flag_reason_usage(db)
    assert any(r["reason"] == "bad" and r["count"] == 2 for r in all_counts)
    assert any(r["reason"] == "worse" and r["count"] == 1 for r in all_counts)

    filtered = get_flag_reason_usage(db, date(2024, 1, 3), None)
    assert any(r["reason"] == "bad" and r["count"] == 1 for r in filtered)
    assert not any(r["reason"] == "worse" and r["count"] == 0 for r in filtered)
    db.close()
