import os  # Standard library for environment variables
import sys  # Standard library for system-specific parameters
from uuid import uuid4  # For generating unique emails
from fastapi.testclient import TestClient  # Import TestClient for endpoint testing

# Ensure modules from the parent directory are importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# Set default environment variables required by the application
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app  # Import the FastAPI application
from auth.auth_utils import create_access_token  # Utility for creating auth tokens

# Initialize the test client with the FastAPI app
client = TestClient(app)


def register_and_login() -> tuple[int, str]:
    """Register a new test user and return their id and auth token."""
    email = f"audit_{uuid4().hex}@example.com"  # Generate a unique email address
    password = "password123"  # Define a static password for all test users
    phone = str(int(uuid4().int % 10_000_000_000)).zfill(10)  # Unique phone number
    user_data = {
        "email": email,  # User email field
        "phone_number": phone,  # Distinct phone to satisfy DB constraint
        "hashed_password": password,  # Password stored directly for simplicity
    }
    response = client.post("/users/", json=user_data)  # Attempt to create user
    assert response.status_code in (200, 201)  # User creation should succeed
    user_id = response.json()["id"]  # Extract the user id from the response
    token = create_access_token({"user_id": user_id})  # Generate auth token
    return user_id, token  # Return both user id and token for use in tests


def test_create_audit_log():
    """Ensure a new audit log can be created successfully."""
    user_id, token = register_and_login()  # Register user and obtain auth token
    log_data = {
        "user_id": user_id,  # Associate the log with the created user
        "action": "test",  # Sample action string
        "detail": "log entry",  # Optional detail field
    }
    headers = {"Authorization": f"Bearer {token}"}  # Authorization header
    response = client.post("/audit-logs/", json=log_data, headers=headers)  # Create log
    assert response.status_code == 200  # Endpoint should return HTTP 200
    data = response.json()  # Parse the JSON response
    assert data["user_id"] == user_id  # Response should contain user_id
    for field in ["id", "user_id", "action", "timestamp"]:
        assert field in data  # Verify required fields are present


def test_get_audit_logs_by_user():
    """Verify that audit logs can be retrieved for a specific user."""
    user_id, token = register_and_login()  # Create a user for the test
    headers = {"Authorization": f"Bearer {token}"}  # Header with token
    for i in range(2):
        log_data = {
            "user_id": user_id,  # Reference the same user for all logs
            "action": f"action_{i}",  # Vary the action for each log
            "detail": "detail",  # Static detail text
        }
        resp = client.post("/audit-logs/", json=log_data, headers=headers)  # Create logs
        assert resp.status_code == 200  # Each creation should succeed
    response = client.get(f"/audit-logs/user/{user_id}")  # Fetch logs for user
    assert response.status_code == 200  # Expect success status
    data = response.json()  # Parse list of logs
    assert isinstance(data, list)  # Response should be a list
    assert len(data) >= 2  # At least the two created logs should be returned


def test_get_all_audit_logs():
    """Check retrieval of all audit logs across users."""
    response = client.get("/audit-logs/")  # Request all audit logs
    assert response.status_code == 200  # Should return success
    data = response.json()  # Parse the list of all logs
    assert isinstance(data, list)  # The response must be a list
