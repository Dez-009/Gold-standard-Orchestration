"""Tests for admin persona snapshot viewer."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
import models  # Import all models so metadata includes every table
from models.agent_timeout_log import AgentTimeoutLog  # Needed for user relationships
from services import user_service
from services.persona_service import get_persona_snapshot
from models.user_persona import UserPersona
from database.session import engine
from database.base import Base
from tests.conftest import TestingSessionLocal

client = TestClient(app)

# Ensure the new table exists for the in-memory DB
Base.metadata.create_all(bind=engine)


def test_persona_snapshot_service_and_route():
    db = TestingSessionLocal()
    # Create regular user
    user = user_service.create_user(
        db,
        {
            "email": f"snap_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    # Persist a snapshot record
    snapshot = UserPersona(user_id=user.id, traits=["kind", "curious"])
    db.add(snapshot)
    db.commit()

    # Verify the service returns expected structure
    data = get_persona_snapshot(db, user.id)
    assert data and data["traits"] == ["kind", "curious"]
    assert data["weights"]["kind"] == 0.5

    # Create admin user to call the API route
    admin = user_service.create_user(
        db,
        {
            "email": f"adm_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": "admin",
        },
    )
    token = create_access_token({"user_id": admin.id})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get(f"/admin/persona/{user.id}/snapshot", headers=headers)
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["traits"] == ["kind", "curious"]
    assert "last_updated" in payload
    db.close()
