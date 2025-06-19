import os
import sys
import httpx
import pytest
from fastapi.testclient import TestClient

# Ensure required environment variable is set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
import services.openai_service as openai_service
import routes.vida as vida_route

client = TestClient(app)


def fake_get_vida_response(prompt: str) -> str:
    return "Mocked response"


@pytest.mark.skipif(os.getenv("CI") == "true", reason="CI environment missing keys")
def test_vida_response(monkeypatch):
    # Patch the OpenAI service and route to avoid external API calls
    monkeypatch.setattr(openai_service, "get_vida_response", fake_get_vida_response)
    monkeypatch.setattr(vida_route, "get_vida_response", fake_get_vida_response)
    response: httpx.Response = client.post(
        "/vida/coach", json={"prompt": "Vida, I feel stuck in my career."}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("response"), str)
    assert data["response"]
