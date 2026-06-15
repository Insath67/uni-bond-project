"""add_user_cover_path

Revision ID: c1e9f7a6d221
Revises: b7d6f4c2e9a1
Create Date: 2026-03-29 05:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1e9f7a6d221"
down_revision: Union[str, None] = "b7d6f4c2e9a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("cover_path", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "cover_path")
