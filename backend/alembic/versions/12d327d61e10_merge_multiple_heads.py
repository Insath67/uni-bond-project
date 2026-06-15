"""merge multiple heads

Revision ID: 12d327d61e10
Revises: 79759d89a753, c1e9f7a6d221
Create Date: 2026-03-29 05:01:26.959367

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12d327d61e10'
down_revision: Union[str, Sequence[str], None] = ('79759d89a753', 'c1e9f7a6d221')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
