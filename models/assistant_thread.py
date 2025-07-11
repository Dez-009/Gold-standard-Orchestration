"""Database model for OpenAI assistant threads."""

import time
from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql import func

from database.base import Base


class AssistantThread(Base):
    """Model representing an OpenAI Assistant thread associated with a user."""
    
    __tablename__ = "assistant_threads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    thread_id = Column(String(255), nullable=False, index=True, unique=True)
    assistant_id = Column(String(255), nullable=False)
    domain = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    thread_metadata = Column(JSON, nullable=True)  # Renamed from metadata to avoid SQLAlchemy reserved name
    last_message_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationship to the user model
    user = relationship("User", back_populates="assistant_threads")
    
    def __repr__(self):
        """String representation of the thread."""
        return f"<AssistantThread(id={self.id}, user_id={self.user_id}, thread_id={self.thread_id})>"
    
    def to_dict(self):
        """Convert the thread to a dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "thread_id": self.thread_id,
            "assistant_id": self.assistant_id,
            "domain": self.domain,
            "is_active": self.is_active,
            "metadata": self.thread_metadata,
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
