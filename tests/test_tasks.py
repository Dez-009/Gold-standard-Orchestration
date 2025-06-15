"""Integration tests for task endpoints."""

# Notes: Import standard libraries for environment setup
import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

# Notes: Ensure project root is on sys.path and env vars are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import the FastAPI app and token utility
from main import app
from auth.auth_utils import create_access_token

# Notes: Create the test client instance
client = TestClient(app)


# Notes: Helper to create a user and return its id and auth token
def register_and_login() -> tuple[int, str]:
    email = f"task_{uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


# Notes: Verify a task can be created for a user
def test_create_task():
    user_id, token = register_and_login()
    task_data = {"user_id": user_id, "description": "Write tests"}
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/tasks/", json=task_data, headers=headers)
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["user_id"] == user_id
    for field in ["id", "description", "is_completed", "created_at"]:
        assert field in data


# Notes: Ensure tasks can be listed for a user
def test_get_tasks_by_user():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(2):
        payload = {"user_id": user_id, "description": f"Task {i}"}
        resp = client.post("/tasks/", json=payload, headers=headers)
        assert resp.status_code in (200, 201)
    resp = client.get(f"/tasks/user/{user_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2


# Notes: Validate a task can be marked complete
def test_complete_task():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post(
        "/tasks/", json={"user_id": user_id, "description": "Finish"}, headers=headers
    )
    assert create_resp.status_code in (200, 201)
    task_id = create_resp.json()["id"]
    complete_resp = client.put(f"/tasks/{task_id}/complete", headers=headers)
    assert complete_resp.status_code == 204
    list_resp = client.get(f"/tasks/user/{user_id}", headers=headers)
    assert list_resp.status_code == 200
    tasks = list_resp.json()
    assert any(t["id"] == task_id and t["is_completed"] for t in tasks)


# Notes: Verify a task can be deleted
def test_delete_task():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    create_resp = client.post(
        "/tasks/", json={"user_id": user_id, "description": "Temp"}, headers=headers
    )
    assert create_resp.status_code in (200, 201)
    task_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/tasks/{task_id}", headers=headers)
    assert delete_resp.status_code == 204
    list_resp = client.get(f"/tasks/user/{user_id}", headers=headers)
    assert list_resp.status_code == 200
    tasks = list_resp.json()
    assert all(t["id"] != task_id for t in tasks)
