"""Integration test for journal PDF export endpoint."""

# Notes: Configure environment and import the app
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

# Notes: Instantiate the test client for HTTP requests
client = TestClient(app)


# Notes: Helper to register a user and return their id along with an auth token
def register_and_login() -> tuple[int, str]:
    import uuid

    email = f"journal_export_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


# Notes: Verify the export route returns a valid PDF document

def test_journal_export_pdf():
    # Notes: Register a test user and create sample journal entries
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(2):
        entry = {"user_id": user_id, "content": f"Entry {i}"}
        resp = client.post("/journals/", json=entry, headers=headers)
        assert resp.status_code in (200, 201)

    # Notes: Request the PDF export and validate the response
    response = client.get("/journals/export", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content  # should contain PDF bytes
