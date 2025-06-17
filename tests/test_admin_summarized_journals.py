import os
import sys
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

# Notes: Ensure imports from parent directory work during tests
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
    """Reset the in-memory database."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user and return id plus auth token."""
    email = f"sj_{uuid.uuid4().hex}@example.com"
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
    """Helper to insert a summarized journal row."""
    record = SummarizedJournal(
        user_id=user_id,
        summary_text=text,
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def test_requires_admin():
    """Non-admin users should not access the list."""
    db = setup_db()
    user_id, token = register_user()
    create_summary(db, user_id, "test")

    resp = client.get(
        "/admin/summarized-journals",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403
    db.close()


def test_filtering_and_serialization():
    """Admin receives serialized records with filtering."""
    db = setup_db()
    user1, _ = register_user()
    user2, admin_token = register_user("admin")
    create_summary(db, user1, "summary one")
    create_summary(db, user2, "summary two")

    resp = client.get(
        "/admin/summarized-journals",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    assert {"summary_text", "user_id", "created_at", "id"}.issubset(data[0].keys())

    resp_filter = client.get(
        f"/admin/summarized-journals?user_id={user1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp_filter.status_code == 200
    filtered = resp_filter.json()
    assert len(filtered) == 1
    assert filtered[0]["user_id"] == user1
    db.close()
