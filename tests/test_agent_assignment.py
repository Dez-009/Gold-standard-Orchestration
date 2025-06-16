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
from services.user_service import create_user
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

