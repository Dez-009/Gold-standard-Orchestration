"""Job to clean up old OpenAI assistant threads."""

import sys
import os

# Add the parent directory to sys.path to import from the root package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session

from database.session import SessionLocal
from services.openai_agent_service import OpenAIAgentService
from utils.logger import get_logger

logger = get_logger()


def cleanup_old_assistant_threads() -> None:
    """Clean up OpenAI assistant threads that are older than the TTL setting."""
    db = SessionLocal()
    try:
        count = OpenAIAgentService.cleanup_old_threads(db)
        logger.info(f"Marked {count} old assistant threads as inactive")
    except Exception as e:
        logger.error(f"Error cleaning up old assistant threads: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Starting assistant thread cleanup job")
    cleanup_old_assistant_threads()
    logger.info("Finished assistant thread cleanup job")
