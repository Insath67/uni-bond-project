"""merge branches

Revision ID: 39d8826b4a43
Revises: 12d327d61e10, 1a2b3c4d5e6f
Create Date: 2026-04-05 02:04:16.114198

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39d8826b4a43'
down_revision: Union[str, Sequence[str], None] = ('12d327d61e10', '1a2b3c4d5e6f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
