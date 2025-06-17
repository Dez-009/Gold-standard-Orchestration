"""Job entry point to recompute churn risk for all users."""

from database.session import SessionLocal
from services.churn_risk_service import recalculate_all_churn_risk


def run() -> None:
    """Execute the batch churn risk recalculation."""
    db = SessionLocal()
    try:
        recalculate_all_churn_risk(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()
