"""Tests for the debug status admin endpoint."""

import os
import sys
from fastapi.testclient import TestClient

# Notes: Configure path and minimal env vars so FastAPI app loads
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.base import Base
from database.session import engine
from sqlalchemy.orm import Session
from database.session import SessionLocal

client = TestClient(app)


def setup_db() -> Session:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


def register_admin() -> str:
    """Register an admin user and return their JWT."""
    db = setup_db()
    user_data = {
        "email": "admin@example.com",
        "phone_number": "1234567890",
        "hashed_password": "pwd",
        "role": "admin",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    db.close()
    return create_access_token({"user_id": user_id})


def test_debug_status_flag():
    """Endpoint should return the boolean debug flag."""
    token = register_admin()
    resp = client.get("/admin/system/debug-status", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "debug" in data
    assert isinstance(data["debug"], bool)
