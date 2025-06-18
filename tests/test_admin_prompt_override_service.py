import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import admin_prompt_override_service
from tests.conftest import TestingSessionLocal


def test_set_and_update_prompt():
    db = TestingSessionLocal()
    agent = f"agent_{uuid.uuid4().hex}"
    first = admin_prompt_override_service.set_custom_prompt(db, agent, "v1")
    assert first.prompt_text == "v1"
    second = admin_prompt_override_service.set_custom_prompt(db, agent, "v2")
    assert second.id == first.id
    assert second.prompt_text == "v2"
    fetched = admin_prompt_override_service.get_active_prompt(db, agent)
    assert fetched and fetched.prompt_text == "v2"
    db.close()


def test_deactivate_prompt():
    db = TestingSessionLocal()
    agent = f"agent_{uuid.uuid4().hex}"
    admin_prompt_override_service.set_custom_prompt(db, agent, "override")
    assert admin_prompt_override_service.get_active_prompt(db, agent)
    admin_prompt_override_service.deactivate_prompt(db, agent)
    assert admin_prompt_override_service.get_active_prompt(db, agent) is None
    db.close()
