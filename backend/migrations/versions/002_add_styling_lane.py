"""Add styling_lane to style_profiles table.

Revision ID: 002_add_styling_lane
Revises: 001_initial_schema
Create Date: 2026-10-13 19:50:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_add_styling_lane'
down_revision: Union[str, Sequence[str], None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade database schema idempotently without data loss."""
    bind = op.get_bind()
    insp = sa.inspect(bind)

    if 'style_profiles' in insp.get_table_names():
        profile_cols = [c['name'] for c in insp.get_columns('style_profiles')]
        if 'styling_lane' not in profile_cols:
            with op.batch_alter_table('style_profiles', schema=None) as batch_op:
                batch_op.add_column(sa.Column('styling_lane', sa.String(length=32), nullable=True))


def downgrade() -> None:
    """Downgrade schema safely."""
    bind = op.get_bind()
    insp = sa.inspect(bind)
    if 'style_profiles' in insp.get_table_names():
        profile_cols = [c['name'] for c in insp.get_columns('style_profiles')]
        if 'styling_lane' in profile_cols:
            with op.batch_alter_table('style_profiles', schema=None) as batch_op:
                batch_op.drop_column('styling_lane')
