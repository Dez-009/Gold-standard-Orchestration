"""Add progress tracking fields to goals table."""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008_add_goal_progress'
down_revision = '007_add_timeout_occurred'
branch_labels = None
depends_on = None


def upgrade():
    """Add progress tracking columns to goals table."""
    op.add_column('goals', sa.Column('target', sa.Integer(), nullable=True))
    op.add_column('goals', sa.Column('progress', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('goals', sa.Column('progress_updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')))


def downgrade():
    """Remove progress tracking columns from goals table."""
    op.drop_column('goals', 'progress_updated_at')
    op.drop_column('goals', 'progress')
    op.drop_column('goals', 'target') 