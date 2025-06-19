import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from database.session import SessionLocal, engine
from database.base import Base
from main import app
from auth.auth_utils import create_access_token
from services import audit_log_service, user_service
from services.admin_agent_service import process_admin_query
from models.subscription import Subscription

client = TestClient(app)


def setup_db() -> Session:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


def register_user(role: str = "user") -> tuple[int, str]:
    email = f"agent_{uuid.uuid4().hex}@example.com"
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


def test_process_query_audit_logs():
    db = setup_db()
    for i in range(2):
        audit_log_service.create_audit_log(
            db, {"user_id": None, "action": f"evt{i}", "detail": "d"}
        )
    result = process_admin_query("show audit logs", db)
    assert "audit_logs" in result
    assert len(result["audit_logs"]) == 2
    db.close()


def test_process_query_subscription_status():
    db = setup_db()
    user = user_service.create_user(
        db,
        {
            "email": "sub_test@example.com",
            "phone_number": "1234567890",
            "hashed_password": "pwd",
        },
    )
    sub = Subscription(
        user_id=user.id, stripe_subscription_id="sub_1", status="active"
    )
    db.add(sub)
    db.commit()
    result = process_admin_query("subscription status for sub_test@example.com", db)
    assert result["subscription_status"] == "active"
    db.close()


def test_admin_agent_route_auth():
    setup_db()
    _, token = register_user()
    resp = client.post(
        "/admin/agent-query",
        json={"user_prompt": "hi"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_admin_agent_route_success():
    setup_db()
    _, admin_token = register_user(role="admin")
    resp = client.post(
        "/admin/agent-query",
        json={"user_prompt": "show audit logs"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert "audit_logs" in resp.json()
