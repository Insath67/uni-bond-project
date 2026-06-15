"""add user follows table

Revision ID: a8f3c1b4d2e1
Revises: 03de020e451c
Create Date: 2026-03-25 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a8f3c1b4d2e1"
down_revision: Union[str, Sequence[str], None] = "03de020e451c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_follows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("follower_id", sa.Integer(), nullable=False),
        sa.Column("following_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["follower_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["following_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("follower_id", "following_id", name="uq_user_follows_follower_following"),
    )
    op.create_index(op.f("ix_user_follows_id"), "user_follows", ["id"], unique=False)
    op.create_index(op.f("ix_user_follows_follower_id"), "user_follows", ["follower_id"], unique=False)
    op.create_index(op.f("ix_user_follows_following_id"), "user_follows", ["following_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_follows_following_id"), table_name="user_follows")
    op.drop_index(op.f("ix_user_follows_follower_id"), table_name="user_follows")
    op.drop_index(op.f("ix_user_follows_id"), table_name="user_follows")
    op.drop_table("user_follows")
