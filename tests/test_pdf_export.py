"""Tests for the summary PDF export endpoint."""

# Notes: Configure environment and imports before loading the app
import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.session import engine
from tests.conftest import TestingSessionLocal as SessionLocal
import services.pdf_export_service as pdf_service

pdf_service.SessionLocal = SessionLocal
from models.journal_summary import JournalSummary

client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user via the API and return id plus token."""
    email = f"summary_pdf_{uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def create_summary(user_id: int) -> JournalSummary:
    """Persist a sample summary for the given user."""
    db = SessionLocal()
    try:
        summary = JournalSummary(
            user_id=user_id,
            summary_text="Example summary",
            source_entry_ids="[]",
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)
        return summary
    finally:
        db.close()


# Notes: Validate that a user can download their own summary

def test_export_summary_pdf():
    user_id, token = register_user()
    summary = create_summary(user_id)
    resp = client.get(
        f"/summaries/{summary.id}/export-pdf",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content


# Notes: Ensure users cannot access summaries belonging to others

def test_export_summary_pdf_unauthorized():
    user1, token1 = register_user()
    summary = create_summary(user1)
    _, token2 = register_user()
    resp = client.get(
        f"/summaries/{summary.id}/export-pdf",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403
