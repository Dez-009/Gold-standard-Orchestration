import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv(".env.test")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from database.base import Base
# Notes: Ensure rate limiter uses a very high threshold during tests
os.environ.setdefault("RATE_LIMIT", "100000/minute")
os.environ.setdefault(
    "ENABLED_FEATURES",
    '["journal","goals","pdf_export","agent_feedback","checkins"]',
)
os.environ.setdefault("TESTING", "true")
from main import app
from database.utils import get_db
from fastapi.testclient import TestClient
import uuid

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Notes: Initial schema created once. Each test will reset tables.
Base.metadata.create_all(bind=engine)


def override_get_db(session: Session):
    """Return a dependency that yields the provided session."""
    def _override():
        try:
            yield session
        finally:
            pass

    return _override




@pytest.fixture
def db_session():
    """Return a fresh database session with isolated tables."""
    # Notes: truncate all tables to ensure a clean state per test
    Base.metadata.drop_all(bind=engine)
    # Notes: PK sequences reset to avoid collisions in bulk runs
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    """FastAPI test client using the isolated session."""
    app.dependency_overrides[get_db] = override_get_db(db_session)
    with TestClient(app) as c:
        yield c




@pytest.fixture
def unique_user_data():
    """Return unique user fields for registration. Randomized per test to avoid collisions."""
    # Notes: ensures each test creates distinct accounts
    def _factory(**overrides):
        # Notes: create randomized email/phone for each call
        data = {
            "email": f"u_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        }
        data.update(overrides)
        return data

    return _factory


@pytest.fixture
def test_user(db_session, unique_user_data):
    """Create and return a persisted user object."""
    from services import user_service

    user = user_service.create_user(db_session, unique_user_data())
    return user


@pytest.fixture
def authorized_client(client, test_user):
    """Test client with JWT credentials for the created user."""
    from auth.auth_utils import create_access_token

    token = create_access_token({"user_id": test_user.id})
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


@pytest.fixture(autouse=True)
def seed_roles(db_session):
    """Ensure required roles exist before each test."""
    try:
        from models.role import Role  # type: ignore
    except Exception:
        yield
        return

    for name in ("admin", "pro"):
        if not db_session.query(Role).filter_by(name=name).first():
            db_session.add(Role(name=name))
    db_session.commit()
    yield
