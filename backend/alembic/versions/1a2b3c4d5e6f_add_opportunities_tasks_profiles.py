"""Add opportunities, tasks, and profiles tables

Revision ID: 1a2b3c4d5e6f
Revises: dc33989f3fe3
Create Date: 2026-04-03 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = 'dc33989f3fe3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create opportunities table
    op.create_table(
        'opportunities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('opportunity_type', sa.Enum('internship', 'freelance', 'part_time', 'full_time', 'project', 'task', name='opportunitytype'), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'active', 'closed', 'completed', name='opportunitystatus'), nullable=False),
        sa.Column('max_applicants', sa.Integer(), nullable=False),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_opportunities_company_id', 'company_id'),
        sa.Index('ix_opportunities_created_at', 'created_at'),
        sa.Index('ix_opportunities_status', 'status'),
        sa.Index('ix_opportunities_title', 'title'),
    )

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('opportunity_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'submitted', 'reviewed', 'approved', 'rejected', 'completed', name='taskstatus'), nullable=False),
        sa.Column('stage', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_tasks_created_at', 'created_at'),
        sa.Index('ix_tasks_opportunity_id', 'opportunity_id'),
        sa.Index('ix_tasks_status', 'status'),
    )

    # Create task_applications table
    op.create_table(
        'task_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('opportunity_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('applied', 'shortlisted', 'rejected', 'accepted', 'completed', name='applicationstatus'), nullable=False),
        sa.Column('cover_letter', sa.Text(), nullable=True),
        sa.Column('resume_url', sa.String(length=500), nullable=True),
        sa.Column('applied_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_task_applications_applied_at', 'applied_at'),
        sa.Index('ix_task_applications_opportunity_id', 'opportunity_id'),
        sa.Index('ix_task_applications_status', 'status'),
        sa.Index('ix_task_applications_student_id', 'student_id'),
    )

    # Create task_submissions table
    op.create_table(
        'task_submissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('submission_text', sa.Text(), nullable=True),
        sa.Column('submission_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'submitted', 'reviewed', 'approved', 'rejected', 'completed', name='taskstatus'), nullable=False),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('notification_type', sa.Enum('application_received', 'application_status', 'task_assigned', 'submission_received', 'feedback_provided', name='notificationtype'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('related_opportunity_id', sa.Integer(), nullable=True),
        sa.Column('related_task_id', sa.Integer(), nullable=True),
        sa.Column('related_application_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['related_application_id'], ['task_applications.id'], ),
        sa.ForeignKeyConstraint(['related_opportunity_id'], ['opportunities.id'], ),
        sa.ForeignKeyConstraint(['related_task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_notifications_created_at', 'created_at'),
        sa.Index('ix_notifications_is_read', 'is_read'),
        sa.Index('ix_notifications_recipient_id', 'recipient_id'),
    )

    # Create company_profiles table
    op.create_table(
        'company_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('company_description', sa.Text(), nullable=True),
        sa.Column('industry', sa.String(length=100), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('established_year', sa.Integer(), nullable=True),
        sa.Column('total_employees', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id'),
    )

    # Create student_profiles table
    op.create_table(
        'student_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('skills', sa.String(), nullable=True),
        sa.Column('experience_level', sa.String(length=50), nullable=True),
        sa.Column('portfolio_url', sa.String(length=500), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('profile_picture_url', sa.String(length=500), nullable=True),
        sa.Column('preferred_work_type', sa.String(length=100), nullable=True),
        sa.Column('available_from', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id'),
    )


def downgrade() -> None:
    op.drop_table('student_profiles')
    op.drop_table('company_profiles')
    op.drop_table('notifications')
    op.drop_table('task_submissions')
    op.drop_table('task_applications')
    op.drop_table('tasks')
    op.drop_table('opportunities')
