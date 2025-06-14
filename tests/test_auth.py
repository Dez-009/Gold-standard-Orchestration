import os
import sys
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app

client = TestClient(app)


def test_register_user():
    user_data = {
        "email": "user@example.com",
        "phone_number": "1234567890",
        "hashed_password": "password123",
        "full_name": "Vida Tester",
        "age": 30,
        "sex": "F",
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    for field in ["id", "email", "is_active"]:
        assert field in data
    assert data["email"] == user_data["email"]


def test_register_duplicate_email():
    user_data = {
        "email": "duplicate@example.com",
        "phone_number": "9876543210",
        "hashed_password": "password123",
    }
    first_response = client.post("/users/", json=user_data)
    assert first_response.status_code in (200, 201)

    second_response = client.post("/users/", json=user_data)
    assert second_response.status_code == 400


def test_login_success():
    credentials = {"username": "user@example.com", "password": "password123"}
    response = client.post("/auth/login", data=credentials)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_failure():
    credentials = {"username": "unknown@example.com", "password": "wrong"}
    response = client.post("/auth/login", data=credentials)
    assert response.status_code == 401
