import os
import sys
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app

client = TestClient(app)


def test_middlewares_load():
    resp = client.get("/reporting/summary")
    assert resp.status_code == 200
