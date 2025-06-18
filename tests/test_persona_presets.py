"""Tests for persona preset CRUD service."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import persona_preset_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def test_persona_preset_service_crud():
    db = TestingSessionLocal()
    preset = persona_preset_service.create_preset(
        db,
        {
            "name": f"Friendly_{uuid.uuid4().hex}",
            "description": "Warm tone",
            "traits": {"empathy": 0.8},
        },
    )
    presets = persona_preset_service.list_presets(db)
    assert len(presets) == 1
    updated = persona_preset_service.update_preset(
        db,
        str(preset.id),
        {"description": "Very warm"},
    )
    assert updated.description == "Very warm"
    persona_preset_service.delete_preset(db, str(preset.id))
    assert persona_preset_service.list_presets(db) == []
    db.close()

