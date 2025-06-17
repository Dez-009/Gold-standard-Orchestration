# Notes: Script to run goal recommendation generation for a segment
from database.session import SessionLocal
from services.personalized_recommendation_service import generate_goals_for_segment


def run(segment_id: str) -> None:
    """Execute the generation process within a DB session."""
    db = SessionLocal()
    try:
        generate_goals_for_segment(db, segment_id)
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: generate_goal_recommendations <segment_id>")
        raise SystemExit(1)
    run(sys.argv[1])
