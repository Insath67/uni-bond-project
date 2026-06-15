"""add new user roles

Revision ID: df66efc42ac3
Revises: 8a6606309c00
Create Date: 2026-03-22 00:25:25.644650

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df66efc42ac3'
down_revision: Union[str, Sequence[str], None] = '8a6606309c00'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'lecturer'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'company'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'tech_lead'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'admin'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
