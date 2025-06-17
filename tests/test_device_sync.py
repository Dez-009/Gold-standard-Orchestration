"""Tests for device sync logging and admin endpoint."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import device_sync_service, user_service
from database.session import engine
from database.base import Base
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    """Ensure test tables are freshly created."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def create_user(role: str = "user") -> tuple[int, str]:
    """Register a user and return id and token."""
    email = f"sync_{uuid.uuid4().hex}@example.com"
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


def test_log_and_list_syncs():
    """Service should persist logs and endpoint should return them."""
    db = setup_db()
    user_id, _ = create_user()
    admin_id, admin_token = create_user("admin")

    # Notes: Write a sample log entry via the service
    device_sync_service.log_sync_event(
        db,
        user_id=user_id,
        source="Fitbit",
        status="success",
        data_preview={"steps": 1000},
    )

    # Notes: Call the admin endpoint to retrieve logs
    resp = client.get(
        "/admin/device-sync-logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert any(row["user_id"] == user_id for row in data)
    db.close()
