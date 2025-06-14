from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import Settings

# Initialize settings instance
settings = Settings()

# Create the SQLAlchemy engine with echo enabled for debugging
engine = create_engine(settings.database_url, echo=True)

# Configure session factory
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

__all__ = ["engine", "SessionLocal"]

