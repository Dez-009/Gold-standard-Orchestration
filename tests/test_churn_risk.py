import os
import sys
import uuid
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import user_service, churn_risk_service
from services import user_session_service
from models.subscription import Subscription
from models.journal_entry import JournalEntry
from models.agent_interaction_log import AgentInteractionLog
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_user(db):
    return user_service.create_user(
        db,
        {
            "email": f"churn_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )


def test_high_risk_score():
    """User with no activity should be high risk."""
    db = TestingSessionLocal()
    user = create_user(db)
    risk = churn_risk_service.calculate_churn_risk(db, user.id)
    assert risk.risk_category == churn_risk_service.RiskCategory.HIGH
    assert risk.risk_score == 1.0
    db.close()


def test_medium_risk_score():
    """Partial activity should place user in medium risk."""
    db = TestingSessionLocal()
    user = create_user(db)

    # Notes: Active subscription counts as one positive factor
    sub = Subscription(
        user_id=user.id,
        stripe_subscription_id=str(uuid.uuid4()),
        status="active",
        created_at=datetime.utcnow(),
    )
    db.add(sub)

    # Notes: One login session within the window
    user_session_service.start_session(db, user.id, None, None)

    db.commit()

    risk = churn_risk_service.calculate_churn_risk(db, user.id)
    assert risk.risk_category == churn_risk_service.RiskCategory.MEDIUM
    assert 0.34 <= risk.risk_score < 0.67
    db.close()


def test_low_risk_score():
    """User with recent activity and subscription should be low risk."""
    db = TestingSessionLocal()
    user = create_user(db)

    # Notes: Create supporting activity for each factor
    JournalEntry(user_id=user.id, content="hi", created_at=datetime.utcnow())
    db.add(Subscription(
        user_id=user.id,
        stripe_subscription_id=str(uuid.uuid4()),
        status="active",
        created_at=datetime.utcnow(),
    ))
    db.add(AgentInteractionLog(user_id=user.id, user_prompt="p", ai_response="r", timestamp=datetime.utcnow()))
    user_session_service.start_session(db, user.id, None, None)

    db.commit()

    risk = churn_risk_service.calculate_churn_risk(db, user.id)
    assert risk.risk_category == churn_risk_service.RiskCategory.LOW
    assert risk.risk_score < 0.34
    db.close()
