"""Database migration adding admin_notes column to summarized_journals."""

# Notes: SQLAlchemy helpers for executing raw SQL
from sqlalchemy import Text, inspect

from database.session import engine


def run_migration():
    """Add admin_notes column if it does not already exist."""

    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('summarized_journals')]
    if 'admin_notes' in columns:
        return

    # Notes: Execute ALTER TABLE to add the new column
    with engine.connect() as connection:
        connection.execute(
            f"ALTER TABLE summarized_journals ADD COLUMN admin_notes TEXT"
        )


if __name__ == "__main__":
    run_migration()

