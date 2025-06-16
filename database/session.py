from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from config import get_settings

# Notes: Load configuration once using the cached settings helper
settings = get_settings()

# Create the SQLAlchemy engine with echo enabled for debugging
engine_kwargs = {"echo": True}
if settings.database_url.startswith("sqlite"):
    engine_kwargs.update(
        {
            "connect_args": {"check_same_thread": False},
            "poolclass": StaticPool,
        }
    )
engine = create_engine(settings.database_url, **engine_kwargs)

# Configure session factory
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

__all__ = ["engine", "SessionLocal"]

