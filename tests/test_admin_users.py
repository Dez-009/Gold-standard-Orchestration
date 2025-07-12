import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def setup_db():
    from database.base import Base
    from database.session import engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def register_user(role: str = "user") -> tuple[int, str]:
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


def test_admin_get_patch_delete_users():
    db = setup_db()
    target_id, _ = register_user()
    _, admin_token = register_user("admin")

    resp = client.get("/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert any(u["id"] == target_id for u in resp.json())

    resp = client.patch(
        f"/admin/users/{target_id}",
        params={"role": "admin"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["role"] == "admin"

    resp = client.delete(
        f"/admin/users/{target_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "deactivated"
    db.close()


def test_patch_invalid_role():
    setup_db()
    uid, _ = register_user()
    _, admin_token = register_user("admin")
    resp = client.patch(
        f"/admin/users/{uid}",
        params={"role": "invalid"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 400


def test_admin_only_access():
    setup_db()
    _, token = register_user()
    resp = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403
