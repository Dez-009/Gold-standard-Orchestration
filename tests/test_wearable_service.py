"""Tests for wearable data service and routes."""

import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import user_service
from database.session import engine
from database.base import Base
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    """Create tables for an isolated database."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def create_user(role: str = "user") -> tuple[int, str]:
    """Register a user and return id plus token."""
    email = f"wear_{uuid4().hex}@example.com"
    user = user_service.create_user(
        TestingSessionLocal(),
        {
            "email": email,
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": role,
        },
    )
    token = create_access_token({"user_id": user.id})
    return user.id, token


def test_store_and_fetch_via_api():
    """POST then GET wearable data should round-trip the value."""
    db = setup_db()
    user_id, token = create_user()

    payload = {
        "source": "fitbit",
        "data_type": "sleep",
        "value": "6.5",
        "recorded_at": "2024-01-01T00:00:00Z",
    }

    # Notes: Use the API to store the metric
    resp = client.post(
        "/user/wearables",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200

    # Notes: Retrieve via API
    resp2 = client.get(
        "/user/wearables",
        headers={"Authorization": f"Bearer {token}"},
        params={"data_type": "sleep"},
    )
    assert resp2.status_code == 200
    data = resp2.json()
    assert data.get("value") == "6.5"

    db.close()
