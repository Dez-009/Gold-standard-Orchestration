import os
import sys
import time
import pytest
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from slowapi import Limiter
from slowapi.util import get_remote_address

pytestmark = pytest.mark.skipif(os.environ.get("TESTING") == "true", reason="Rate limiter is disabled during tests.")

def test_rate_limiter_triggers():
    original_limiter = app.state.limiter
    app.state.limiter = Limiter(key_func=get_remote_address, default_limits=["5/second"])
    with TestClient(app) as client:
        app.state.limiter.reset()
        # Exhaust the limit
        for _ in range(5):
            resp = client.get("/reporting/summary")
            assert resp.status_code == 200

        resp = client.get("/reporting/summary")
        assert resp.status_code == 429
        assert "Too Many Requests" in resp.text
    app.state.limiter = original_limiter


def test_rate_limiter_resets():
    original_limiter = app.state.limiter
    app.state.limiter = Limiter(key_func=get_remote_address, default_limits=["5/second"])
    with TestClient(app) as client:
        app.state.limiter.reset()
        for _ in range(5):
            resp = client.get("/reporting/summary")
            assert resp.status_code == 200

        # Wait for window to expire
        time.sleep(1.1)

        for _ in range(5):
            resp = client.get("/reporting/summary")
            assert resp.status_code == 200
    app.state.limiter = original_limiter
