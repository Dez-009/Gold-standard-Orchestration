"""Database migration adding timeout_occurred column to orchestration_performance_logs."""

# Notes: SQLAlchemy helpers for executing raw SQL
from sqlalchemy import inspect

from database.session import engine


def run_migration():
    """Add timeout_occurred column if it does not already exist."""

    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('orchestration_performance_logs')]
    if 'timeout_occurred' in columns:
        return

    # Notes: Execute ALTER TABLE to add the new boolean column
    with engine.connect() as connection:
        connection.execute(
            "ALTER TABLE orchestration_performance_logs ADD COLUMN timeout_occurred BOOLEAN DEFAULT FALSE"
        )


if __name__ == "__main__":
    run_migration()
