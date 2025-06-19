import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Configure import path and default env vars for testing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import admin_agent_assignment_service, personality_service, user_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to register a user and return id and token
def register_user(role: str = "user") -> tuple[int, str, str]:
    email = f"assign_{uuid.uuid4().hex}@example.com"
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
    return user_id, token, email


# Verify service layer can create and list assignments
def test_service_assign_and_list():
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": f"svc_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    personality = personality_service.create_personality(
        db,
        {
            "name": f"Helper_{uuid.uuid4().hex}",
            "description": "test",
            "system_prompt": "hi",
        },
    )
    admin_agent_assignment_service.assign_agent(
        db, user.id, "career", personality.name
    )
    rows = admin_agent_assignment_service.list_agent_assignments(db)
    assert any(r["user_id"] == user.id for r in rows)
    db.close()


# Ensure admin endpoint assigns an agent to any user
def test_admin_endpoint_flow():
    # Notes: create user and personality
    target_id, _, _ = register_user()
    admin_id, admin_token, _ = register_user("admin")
    db = TestingSessionLocal()
    personality = personality_service.create_personality(
        db,
        {
            "name": f"P_{uuid.uuid4().hex}",
            "description": "d",
            "system_prompt": "s",
        },
    )
    db.close()

    resp = client.post(
        "/admin/agent-assignments",
        json={"user_id": target_id, "domain": "career", "assigned_agent": personality.name},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == target_id
    assert data["domain"] == "career"
    assert data["assigned_agent"] == personality.name

    # Notes: Verify listing endpoint returns the new assignment
    list_resp = client.get(
        "/admin/agent-assignments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert list_resp.status_code == 200
    assert any(r["user_id"] == target_id for r in list_resp.json())

