import os
import sys
from fastapi.testclient import TestClient
from fastapi import APIRouter

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app

client = TestClient(app, raise_server_exceptions=False)

router = APIRouter()

@router.get("/raise-exception")
def raise_exception():
    raise Exception("Simulated internal error")

app.include_router(router)


def test_global_exception_handler():
    response = client.get("/raise-exception")
    assert response.status_code == 500
    assert response.json() == {"detail": "Internal Server Error"}
