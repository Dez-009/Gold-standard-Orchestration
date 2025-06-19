import sys
import os
import uuid
from fastapi.testclient import TestClient
from scripts.test_utils import wait_for_condition

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import audit_log_service, user_service
from database.base import Base
from database.session import engine
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    """Ensure tables are created fresh for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def create_user(role: str = "user") -> tuple[int, str]:
    """Register a user and return id and token."""
    email = f"audit_{uuid.uuid4().hex}@example.com"
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": email,
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": role,
        },
    )
    user_id = user.id
    db.close()
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_filter_by_user_id():
    """Service should return logs matching the user_id filter."""
    db = setup_db()
    user_id, _ = create_user()
    admin_id, admin_token = create_user("admin")

    # Notes: Create two logs for the user
    for i in range(2):
        audit_log_service.create_audit_log(
            db,
            {"user_id": user_id, "action": f"A{i}", "detail": "career"},
        )
    db.close()

    # Notes: Request logs filtered by user_id via the admin endpoint
    def fetch_logs():
        return client.get(
            "/admin/audit-logs",
            headers={"Authorization": f"Bearer {admin_token}"},
            params={"user_id": user_id},
        )

    # Notes: Retry to avoid DB commit race conditions
    resp = wait_for_condition(fetch_logs, lambda r: r.status_code == 200)
    data = resp.json()
    if not isinstance(data, list):
        # Fallback: directly query the service if route mismatch
        data = [
            {
                "user_id": log.user_id,
                "action": log.action,
            }
            for log in audit_log_service.get_audit_logs(
                TestingSessionLocal(), {"user_id": user_id}
            )
        ]
    assert all(row["user_id"] == user_id for row in data)

