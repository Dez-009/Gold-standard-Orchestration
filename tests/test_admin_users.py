import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import user_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    """Reset database and return session."""
    from database.base import Base
    from database.session import engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user via the API and return id and JWT."""
    email = f"u_{uuid.uuid4().hex}@example.com"
    data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_admin_can_list_and_update_users():
    db = setup_db()
    # create target user and admin
    target_id, _ = register_user()
    _, admin_token = register_user("admin")

    # list all users
    resp = client.get("/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert any(u["id"] == target_id for u in resp.json())

    # update user
    upd = {"full_name": "Updated"}
    resp = client.put(
        f"/admin/users/{target_id}",
        json=upd,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated"
    db.close()


def test_non_admin_forbidden():
    setup_db()
    _, token = register_user()
    resp = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403
