import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import prompt_version_service
from tests.conftest import TestingSessionLocal, engine
from database.base import Base


def test_create_and_fetch_prompt_versions():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    pv1 = prompt_version_service.create_prompt_version(
        db,
        "career",
        "v1",
        "Prompt one",
        {"temperature": 0.6},
    )
    pv2 = prompt_version_service.create_prompt_version(
        db,
        "career",
        "v2",
        "Prompt two",
    )

    latest = prompt_version_service.get_latest_prompt(db, "career")
    assert latest.id == pv2.id

    specific = prompt_version_service.get_prompt_by_version(db, "career", "v1")
    assert specific.prompt_template == "Prompt one"

    db.close()
