"""Unit tests for the flag reason service."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import flag_reason_service
from tests.conftest import TestingSessionLocal


def test_create_and_list_and_delete():
    db = TestingSessionLocal()
    # Create a reason
    r = flag_reason_service.create_flag_reason(db, "Inappropriate", "Safety")
    assert r.id is not None
    # Verify listing returns the reason
    rows = flag_reason_service.list_flag_reasons(db)
    assert any(x.label == "Inappropriate" for x in rows)
    # Delete the reason
    ok = flag_reason_service.delete_flag_reason(db, r.id)
    assert ok
    rows = flag_reason_service.list_flag_reasons(db)
    assert len(rows) == 0
    db.close()
