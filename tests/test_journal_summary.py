"""Integration test for the journal summary endpoint."""

# Notes: Configure environment and imports before loading the app
import os
import sys
from factories.user_factory import create_user
from factories.journal_factory import create_journal

# Notes: Ensure the project root is importable and env vars are set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token



# Notes: Helper to register a user and return id with auth token
def register_and_login(db):
    """Create a test user using factories and return auth token."""
    user = create_user(db)
    token = create_access_token({"user_id": user.id})
    return user.id, token


# Notes: Validate that the journal summary endpoint returns a summary string

def test_journal_summary(client, db_session, monkeypatch):
    # Notes: Register a user and obtain token
    user_id, token = register_and_login(db_session)
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Create sample journal entries for the user
    for _ in range(2):
        create_journal(db_session, user_id)

    # Notes: Patch the summarization service to avoid calling OpenAI
    import services.ai_processor as ai_processor
    monkeypatch.setattr(ai_processor, "generate_journal_summary", lambda *_: "Mock Summary")
    import orchestration.executor as executor
    monkeypatch.setattr(
        executor,
        "execute_agent",
        lambda *_args, **_kw: executor.AgentOutput(
            text="Mock Summary", retry_count=0, timeout_occurred=False
        ),
    )

    # Notes: Request the journal summary
    response = client.get("/ai/journal-summary", headers=headers)

    # Notes: Verify a successful response containing a summary string
    assert response.status_code == 200
    data = response.json()
    # Notes: Response includes summary text and metadata fields
    assert "summary" in data
    assert isinstance(data["summary"], str)
    assert "retry_count" in data
    assert "timeout_occurred" in data
