import os
import sys
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def test_access_protected_route_with_valid_token():
    user_data = {
        "email": "protected@example.com",
        "phone_number": "1112223333",
        "hashed_password": "secretpass",
    }
    create_resp = client.post("/users/", json=user_data)
    assert create_resp.status_code in (200, 201)
    user_id = create_resp.json()["id"]

    token = create_access_token({"user_id": user_id}, expires_delta=timedelta(minutes=5))
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/protected/test", headers=headers)
    assert resp.status_code == 200
    assert resp.json().get("message") == "Access granted"


def test_access_protected_route_with_invalid_token():
    headers = {"Authorization": "Bearer invalidtoken"}
    resp = client.get("/protected/test", headers=headers)
    assert resp.status_code == 401


def test_access_protected_route_without_token():
    resp = client.get("/protected/test")
    assert resp.status_code == 401
