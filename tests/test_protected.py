import os
import sys
from fastapi.testclient import TestClient

# Ensure env vars set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app

client = TestClient(app)


def test_protected_access():
    user_data = {
        "email": "protected@example.com",
        "phone_number": "1112223333",
        "hashed_password": "secretpass",
    }
    create_resp = client.post("/users/", json=user_data)
    assert create_resp.status_code in (200, 201)
    user_id = create_resp.json()["id"]

    login_resp = client.post(
        "/auth/login",
        data={"username": user_data["email"], "password": user_data["hashed_password"]},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    resp = client.get("/protected/test", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "Access granted"
    assert data["user_id"] == user_id


def test_protected_unauthorized():
    resp = client.get("/protected/test")
    assert resp.status_code == 401

