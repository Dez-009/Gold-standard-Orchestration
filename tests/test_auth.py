import os
import sys
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app

client = TestClient(app)


def test_register_user(unique_user_data):
    user_data = unique_user_data(
        full_name="Vida Tester",
        age=30,
        sex="F",
    )
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    for field in ["id", "email", "is_active"]:
        assert field in data
    assert data["email"] == user_data["email"]


def test_register_duplicate_email(unique_user_data):
    user_data = unique_user_data()
    first_response = client.post("/users/", json=user_data)
    assert first_response.status_code in (200, 201)

    second_response = client.post("/users/", json=user_data)
    assert second_response.status_code == 400


def test_login_success(unique_user_data):
    user_data = unique_user_data()
    client.post("/users/", json=user_data)
    credentials = {"username": user_data["email"], "password": "password123"}
    response = client.post("/auth/login", json=credentials)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_failure():
    credentials = {"username": "unknown@example.com", "password": "wrong"}
    response = client.post("/auth/login", json=credentials)
    assert response.status_code == 401


def test_admin_register_and_login(unique_user_data):
    """Verify admin user can register via auth endpoint and log in."""
    user_data = unique_user_data(role="admin", access_code="VIDA_ADMIN_2025")
    reg_resp = client.post("/auth/register", json=user_data)
    assert reg_resp.status_code in (200, 201)

    login_resp = client.post(
        "/auth/login",
        json={"username": user_data["email"], "password": "password123"},
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()
