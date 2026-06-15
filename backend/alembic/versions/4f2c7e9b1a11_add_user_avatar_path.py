"""add_user_avatar_path

Revision ID: 4f2c7e9b1a11
Revises: 03de020e451c
Create Date: 2026-03-29 03:22:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4f2c7e9b1a11"
down_revision: Union[str, Sequence[str], None] = "03de020e451c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_path", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar_path")
