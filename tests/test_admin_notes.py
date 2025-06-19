import os
import sys
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.session import engine
from database.base import Base
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    """Initialize in-memory database for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user and return id plus auth token."""
    email = f"an_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def create_summary(db, user_id: int, text: str) -> SummarizedJournal:
    """Helper to insert a summary row."""
    record = SummarizedJournal(
        user_id=user_id,
        summary_text=text,
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def test_patch_updates_notes():
    """Admin can update notes on a summary."""
    db = setup_db()
    uid, _ = register_user()
    summary = create_summary(db, uid, "text")
    _, admin_token = register_user("admin")

    resp = client.patch(
        f"/admin/journal-summaries/{summary.id}/notes",
        json={"notes": "check"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["admin_notes"] == "check"

    db.expire_all()
    row = db.query(SummarizedJournal).get(summary.id)
    assert row.admin_notes == "check"
    db.close()


def test_patch_requires_admin():
    """Non-admins cannot update notes."""
    db = setup_db()
    uid, token = register_user()
    summary = create_summary(db, uid, "text")

    resp = client.patch(
        f"/admin/journal-summaries/{summary.id}/notes",
        json={"notes": "oops"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403
    db.close()
