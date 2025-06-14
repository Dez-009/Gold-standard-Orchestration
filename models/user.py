from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from database.base import Base


class User(Base):
    """SQLAlchemy model for application users."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete"
    )
