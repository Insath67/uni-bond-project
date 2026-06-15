"""add kuppy request workflow

Revision ID: 79759d89a753
Revises: 4f1576fc7873
Create Date: 2026-03-29 03:14:49.588297

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '79759d89a753'
down_revision: Union[str, Sequence[str], None] = '4f1576fc7873'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    kuppy_request_status = postgresql.ENUM(
        "open",
        "scheduled",
        "completed",
        name="kuppyrequeststatus",
        create_type=False,
    )
    kuppy_offer_status = postgresql.ENUM(
        "open",
        "selected",
        "withdrawn",
        name="kuppyofferstatus",
        create_type=False,
    )
    kuppy_session_status = postgresql.ENUM(
        "scheduled",
        "live",
        "completed",
        "cancelled",
        name="kuppysessionstatus",
        create_type=False,
    )

    # Create enum types idempotently so partially initialized databases
    # don't fail with "type already exists".
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kuppyrequeststatus') THEN
                CREATE TYPE kuppyrequeststatus AS ENUM ('open', 'scheduled', 'completed');
            END IF;
        END
        $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kuppyofferstatus') THEN
                CREATE TYPE kuppyofferstatus AS ENUM ('open', 'selected', 'withdrawn');
            END IF;
        END
        $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kuppysessionstatus') THEN
                CREATE TYPE kuppysessionstatus AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
            END IF;
        END
        $$;
        """
    )

    op.drop_table("kuppy_participants")
    op.drop_table("kuppy_sessions")

    op.create_table(
        "kuppy_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("module_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("requested_before", sa.DateTime(timezone=True), nullable=False),
        sa.Column("current_student_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", kuppy_request_status, nullable=False, server_default="open"),
        sa.Column("selected_offer_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_kuppy_requests_id"), "kuppy_requests", ["id"], unique=False)
    op.create_index(op.f("ix_kuppy_requests_student_id"), "kuppy_requests", ["student_id"], unique=False)

    op.create_table(
        "kuppy_offers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=False),
        sa.Column("lecturer_id", sa.Integer(), nullable=False),
        sa.Column("availability_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("availability_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", kuppy_offer_status, nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["lecturer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["kuppy_requests.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_kuppy_offers_id"), "kuppy_offers", ["id"], unique=False)
    op.create_index(op.f("ix_kuppy_offers_lecturer_id"), "kuppy_offers", ["lecturer_id"], unique=False)
    op.create_index(op.f("ix_kuppy_offers_request_id"), "kuppy_offers", ["request_id"], unique=False)

    op.create_table(
        "kuppy_request_votes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["request_id"], ["kuppy_requests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("request_id", "user_id", name="uq_kuppy_request_vote_user"),
    )
    op.create_index(op.f("ix_kuppy_request_votes_id"), "kuppy_request_votes", ["id"], unique=False)
    op.create_index(op.f("ix_kuppy_request_votes_request_id"), "kuppy_request_votes", ["request_id"], unique=False)
    op.create_index(op.f("ix_kuppy_request_votes_user_id"), "kuppy_request_votes", ["user_id"], unique=False)

    op.create_table(
        "kuppy_session_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lecturer_id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("module_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("scheduled_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("scheduled_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_students", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", kuppy_session_status, nullable=False, server_default="scheduled"),
        sa.Column("auto_delete_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["lecturer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["kuppy_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("request_id"),
    )
    op.create_index(op.f("ix_kuppy_session_events_id"), "kuppy_session_events", ["id"], unique=False)
    op.create_index(op.f("ix_kuppy_session_events_lecturer_id"), "kuppy_session_events", ["lecturer_id"], unique=False)

    op.create_table(
        "kuppy_session_enrollments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["kuppy_session_events.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "user_id", name="uq_kuppy_session_participant"),
    )
    op.create_index(op.f("ix_kuppy_session_enrollments_id"), "kuppy_session_enrollments", ["id"], unique=False)
    op.create_index(op.f("ix_kuppy_session_enrollments_session_id"), "kuppy_session_enrollments", ["session_id"], unique=False)
    op.create_index(op.f("ix_kuppy_session_enrollments_user_id"), "kuppy_session_enrollments", ["user_id"], unique=False)

    op.create_foreign_key(
        "fk_kuppy_requests_selected_offer_id",
        "kuppy_requests",
        "kuppy_offers",
        ["selected_offer_id"],
        ["id"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("fk_kuppy_requests_selected_offer_id", "kuppy_requests", type_="foreignkey")
    op.drop_index(op.f("ix_kuppy_session_enrollments_user_id"), table_name="kuppy_session_enrollments")
    op.drop_index(op.f("ix_kuppy_session_enrollments_session_id"), table_name="kuppy_session_enrollments")
    op.drop_index(op.f("ix_kuppy_session_enrollments_id"), table_name="kuppy_session_enrollments")
    op.drop_table("kuppy_session_enrollments")

    op.drop_index(op.f("ix_kuppy_session_events_lecturer_id"), table_name="kuppy_session_events")
    op.drop_index(op.f("ix_kuppy_session_events_id"), table_name="kuppy_session_events")
    op.drop_table("kuppy_session_events")

    op.drop_index(op.f("ix_kuppy_request_votes_user_id"), table_name="kuppy_request_votes")
    op.drop_index(op.f("ix_kuppy_request_votes_request_id"), table_name="kuppy_request_votes")
    op.drop_index(op.f("ix_kuppy_request_votes_id"), table_name="kuppy_request_votes")
    op.drop_table("kuppy_request_votes")

    op.drop_index(op.f("ix_kuppy_offers_request_id"), table_name="kuppy_offers")
    op.drop_index(op.f("ix_kuppy_offers_lecturer_id"), table_name="kuppy_offers")
    op.drop_index(op.f("ix_kuppy_offers_id"), table_name="kuppy_offers")
    op.drop_table("kuppy_offers")

    op.drop_index(op.f("ix_kuppy_requests_student_id"), table_name="kuppy_requests")
    op.drop_index(op.f("ix_kuppy_requests_id"), table_name="kuppy_requests")
    op.drop_table("kuppy_requests")

    op.create_table(
        "kuppy_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("host_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("datetime_schedule", sa.DateTime(timezone=True), nullable=False),
        sa.Column("points_earned", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_kuppy_sessions_id"), "kuppy_sessions", ["id"], unique=False)

    op.create_table(
        "kuppy_participants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["session_id"], ["kuppy_sessions.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_kuppy_participants_id"), "kuppy_participants", ["id"], unique=False)

    bind = op.get_bind()
    sa.Enum(name="kuppyrequeststatus").drop(bind, checkfirst=True)
    sa.Enum(name="kuppyofferstatus").drop(bind, checkfirst=True)
    sa.Enum(name="kuppysessionstatus").drop(bind, checkfirst=True)
