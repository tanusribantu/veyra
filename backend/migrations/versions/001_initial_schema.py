"""Initial schema and user auth_user_id migration.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-11 12:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade database schema idempotently."""
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing_tables = insp.get_table_names()

    # Create any missing tables from current models metadata
    from backend.app.models.base import db
    import backend.app.models  # noqa: F401
    db.metadata.create_all(bind=bind)

    # Refresh inspector after table creation
    insp = sa.inspect(bind)

    # Ensure auth_user_id exists on users
    if 'users' in insp.get_table_names():
        user_cols = [c['name'] for c in insp.get_columns('users')]
        if 'auth_user_id' not in user_cols:
            with op.batch_alter_table('users', schema=None) as batch_op:
                batch_op.add_column(sa.Column('auth_user_id', sa.String(length=128), nullable=True))
                batch_op.create_index(batch_op.f('ix_users_auth_user_id'), ['auth_user_id'], unique=True)

    # Ensure fit_notes exists on recommendations
    if 'recommendations' in insp.get_table_names():
        rec_cols = [c['name'] for c in insp.get_columns('recommendations')]
        if 'fit_notes' not in rec_cols:
            with op.batch_alter_table('recommendations', schema=None) as batch_op:
                batch_op.add_column(sa.Column('fit_notes', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    insp = sa.inspect(bind)
    if 'users' in insp.get_table_names():
        user_cols = [c['name'] for c in insp.get_columns('users')]
        if 'auth_user_id' in user_cols:
            with op.batch_alter_table('users', schema=None) as batch_op:
                batch_op.drop_index(batch_op.f('ix_users_auth_user_id'))
                batch_op.drop_column('auth_user_id')
