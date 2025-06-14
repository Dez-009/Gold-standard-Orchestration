import httpx
from fastapi.testclient import TestClient

from pathlib import Path
import sys
import os

sys.path.append(str(Path(__file__).resolve().parents[1]))

# Provide dummy OpenAI API key for settings import
os.environ.setdefault("OPENAI_API_KEY", "test-key")

from main import app


def test_healthcheck() -> None:
    client = TestClient(app)
    response = client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Vida Coach API is running"}
