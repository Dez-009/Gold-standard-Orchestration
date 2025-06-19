import os
import sys
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app

client = TestClient(app)


def test_reporting_summary():
    resp = client.get("/reporting/summary")
    assert resp.status_code == 200
    data = resp.json()

    for key in ["total_users", "total_journals", "total_goals", "total_checkins"]:
        assert key in data
        assert isinstance(data[key], int)
        assert data[key] >= 0
