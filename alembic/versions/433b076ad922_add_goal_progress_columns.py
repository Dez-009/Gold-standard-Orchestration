"""add goal progress columns

Revision ID: 433b076ad922
Revises: 9423b7b24f68
Create Date: 2025-07-12 01:40:17.855706

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "433b076ad922"
down_revision: Union[str, Sequence[str], None] = "9423b7b24f68"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema by adding progress tracking columns."""
    op.add_column(
        "goals",
        sa.Column("progress", sa.Integer(), nullable=True, server_default="0"),
    )
    op.add_column(
        "goals",
        sa.Column("target", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    """Remove progress tracking columns."""
    op.drop_column("goals", "target")
    op.drop_column("goals", "progress")
