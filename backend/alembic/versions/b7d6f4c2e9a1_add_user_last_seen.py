"""add user last_seen field

Revision ID: b7d6f4c2e9a1
Revises: a8f3c1b4d2e1
Create Date: 2026-03-29 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7d6f4c2e9a1"
down_revision: Union[str, Sequence[str], None] = "a8f3c1b4d2e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "last_seen")
