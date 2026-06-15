"""merge heads

Revision ID: 4f1576fc7873
Revises: 4f2c7e9b1a11, b7d6f4c2e9a1
Create Date: 2026-03-29 03:14:02.209790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f1576fc7873'
down_revision: Union[str, Sequence[str], None] = ('4f2c7e9b1a11', 'b7d6f4c2e9a1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
