"""Tests for wearable sync logging model and admin route."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import wearable_sync_service, user_service
from database.session import engine
from database.base import Base
from tests.conftest import TestingSessionLocal
from models.wearable_sync_log import SyncStatus

client = TestClient(app)


def setup_db():
    """Reset all tables for a clean state."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def create_user(role: str = "user") -> tuple[int, str]:
    """Helper to register a user and return id and token."""
    email = f"wsync_{uuid.uuid4().hex}@example.com"
    user = user_service.create_user(
        TestingSessionLocal(),
        {
            "email": email,
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": role,
        },
    )
    token = create_access_token({"user_id": user.id})
    return user.id, token


def test_log_and_fetch_wearable_syncs():
    """Persist wearable sync via service and fetch via admin endpoint."""
    db = setup_db()
    user_id, _ = create_user()
    _, admin_token = create_user("admin")

    wearable_sync_service.log_sync_event(
        db,
        user_id=user_id,
        device_type="oura",
        status=SyncStatus.SUCCESS,
        raw_data_url="http://example.com/data.json",
    )

    resp = client.get(
        "/admin/wearables/sync-logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert any(row["device_type"] == "oura" for row in data)
    db.close()
