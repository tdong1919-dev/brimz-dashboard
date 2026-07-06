"""staff_users password_hash (Milestone 3 auth)

Revision ID: c7e1a9d20f44
Revises: b4d4b53fa3e7
Create Date: 2026-07-03 10:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c7e1a9d20f44'
down_revision: Union[str, None] = 'b4d4b53fa3e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable so existing rows stay valid; NULL means the user cannot log in.
    op.add_column('staff_users', sa.Column('password_hash', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('staff_users', 'password_hash')
