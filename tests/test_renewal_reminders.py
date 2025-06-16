import os
import sys
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Ensure application imports and env vars
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.session import SessionLocal
from models.user import User
from models.subscription import Subscription
from models.audit_log import AuditLog
from services.billing_reminder_service import send_renewal_reminders

client = TestClient(app)


def register_and_login(role: str = "user") -> tuple[int, str]:
    """Create a user and return its id with an auth token."""
    email = f"rem_{uuid.uuid4().hex}@example.com"
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


def create_subscription(user_id: int, days: int) -> Subscription:
    """Insert a subscription with a current period end in ``days`` days."""
    db = SessionLocal()
    sub = Subscription(
        user_id=user_id,
        stripe_subscription_id=f"sub_{uuid.uuid4().hex}",
        status="active",
        current_period_end=datetime.utcnow() + timedelta(days=days),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    db.close()
    return sub


def test_send_reminders_creates_logs():
    """Service should log reminders for upcoming renewals."""
    user_id, _ = register_and_login()
    create_subscription(user_id, 5)
    create_subscription(user_id, 10)

    send_renewal_reminders(days=7)

    db = SessionLocal()
    logs = db.query(AuditLog).filter_by(action="renewal_reminder").all()
    db.close()
    assert len(logs) == 1
    assert logs[0].user_id == user_id


def test_reminder_route_requires_admin():
    """Non-admin users should be forbidden from triggering reminders."""
    user_id, token = register_and_login()
    create_subscription(user_id, 3)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/admin/system/send_renewal_reminders", headers=headers)
    assert resp.status_code == 403


def test_reminder_route_triggers_for_admin():
    """Admin route should invoke reminder service."""
    user_id, token = register_and_login(role="admin")
    create_subscription(user_id, 3)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/admin/system/send_renewal_reminders", headers=headers)
    assert resp.status_code == 200
    db = SessionLocal()
    logs = db.query(AuditLog).filter_by(action="renewal_reminder", user_id=user_id).all()
    db.close()
    assert len(logs) == 1
