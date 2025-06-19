import os
import sys
import uuid
from fastapi.testclient import TestClient

# Ensure application modules can be imported and environment vars are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.agent_assignment_service import assign_agent
from models.audit_log import AuditEventType
from services.user_service import create_user
from services import personality_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to create a user and return id and token
def register_and_login() -> tuple[int, str]:
    email = f"assign_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token

# Helper used in admin tests to create user with specific role
def register_user_with_role(role: str = "user") -> tuple[int, str, str]:
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


# Verify the service layer stores an assignment record
def test_assign_agent_service():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"service_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    assignment = assign_agent(db, user.id, "career")
    assert assignment.user_id == user.id
    assert assignment.agent_type == "career"
    assert assignment.assigned_at is not None
    db.close()


# Ensure the API endpoint creates an assignment for the logged-in user
def test_assign_agent_endpoint():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/account/assign_agent", json={"domain": "health"}, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["agent_type"] == "health"
    assert "assigned_at" in data


def test_list_assignments_requires_admin():
    """Regular users should not access the assignment list."""
    user_id, token, _ = register_user_with_role()
    client.post(
        "/account/assign_agent",
        json={"domain": "career"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get("/admin/agents", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_admin_can_list_assignments():
    """Admin users should receive assignment records."""
    _, user_token, email = register_user_with_role()
    client.post(
        "/account/assign_agent",
        json={"domain": "health"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    _, admin_token, _ = register_user_with_role(role="admin")
    resp = client.get(
        "/admin/agents",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(a["user_email"] == email for a in data)


def test_admin_can_assign_agent_to_user():
    """Admin endpoint should create an assignment for any user."""
    user_id, _, _ = register_user_with_role()
    _, admin_token, _ = register_user_with_role(role="admin")

    db = TestingSessionLocal()
    personality = personality_service.create_personality(
        db,
        {
            "name": f"Fin_{uuid.uuid4().hex}",
            "description": "d",
            "system_prompt": "s",
        },
    )
    db.close()

    resp = client.post(
        "/admin/agent-assignments",
        json={"user_id": user_id, "domain": "career", "assigned_agent": personality.name},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["domain"] == "career"
    assert data["assigned_agent"] == personality.name


def test_user_cannot_assign_agent_via_admin_route():
    """Non-admin users should receive 403 when hitting admin endpoint."""
    target_id, _, _ = register_user_with_role()
    _, token, _ = register_user_with_role()
    resp = client.post(
        "/admin/agent-assignments",
        json={"user_id": target_id, "domain": "career", "assigned_agent": "x"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_admin_assignment_creates_audit_log():
    """Audit log should record admin agent assignments."""

    # Notes: Create a regular user that will receive the assignment
    target_id, _, _ = register_user_with_role()

    # Notes: Register an admin user to perform the assignment
    admin_id, admin_token, _ = register_user_with_role(role="admin")
    db = TestingSessionLocal()
    personality = personality_service.create_personality(
        db,
        {
            "name": f"Health_{uuid.uuid4().hex}",
            "description": "d",
            "system_prompt": "s",
        },
    )
    db.close()

    # Notes: Perform the admin assignment operation via the API
    resp = client.post(
        "/admin/agent-assignments",
        json={"user_id": target_id, "domain": "health", "assigned_agent": personality.name},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code in (200, 201)

    # Notes: Retrieve audit logs for the admin to verify the entry
    logs_resp = client.get(f"/audit-logs/user/{target_id}")
    assert logs_resp.status_code == 200
    logs = logs_resp.json()
    # Notes: Ensure the AGENT_ASSIGNMENT event was recorded
    assert any(
        log["action"] == AuditEventType.AGENT_ASSIGNMENT.value for log in logs
    )

