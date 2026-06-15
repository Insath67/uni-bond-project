from sqlalchemy import Column, String, DateTime, Enum, Integer, Text, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class OpportunityStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    closed = "closed"
    completed = "completed"


class OpportunityType(str, enum.Enum):
    internship = "internship"
    freelance = "freelance"
    part_time = "part_time"
    full_time = "full_time"
    project = "project"
    task = "task"


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    opportunity_type = Column(Enum(OpportunityType), nullable=False)
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    location = Column(String(255), nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(Enum(OpportunityStatus), default=OpportunityStatus.draft, index=True)
    max_applicants = Column(Integer, default=50)
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("User", foreign_keys=[company_id])
    applications = relationship("TaskApplication", back_populates="opportunity", cascade="all, delete-orphan")


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    submitted = "submitted"
    reviewed = "reviewed"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"


class Task(Base):
    __tablename__ = "opportunity_tasks"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.pending, index=True)
    stage = Column(String(100), nullable=True)  # For staged tasks
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    opportunity = relationship("Opportunity", foreign_keys=[opportunity_id])
    submissions = relationship("TaskSubmission", back_populates="task", cascade="all, delete-orphan")


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    rejected = "rejected"
    accepted = "accepted"
    completed = "completed"


class TaskApplication(Base):
    __tablename__ = "task_applications"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied, index=True)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    opportunity = relationship("Opportunity", back_populates="applications", foreign_keys=[opportunity_id])
    student = relationship("User", foreign_keys=[student_id])


class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("opportunity_tasks.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    submission_text = Column(Text, nullable=True)
    submission_url = Column(String(500), nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.submitted, index=True)
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="submissions", foreign_keys=[task_id])
    student = relationship("User", foreign_keys=[student_id])


class NotificationType(str, enum.Enum):
    application_received = "application_received"
    application_status = "application_status"
    task_assigned = "task_assigned"
    submission_received = "submission_received"
    feedback_provided = "feedback_provided"


class Notification(Base):
    __tablename__ = "opportunity_notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    related_opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    related_task_id = Column(Integer, ForeignKey("opportunity_tasks.id"), nullable=True)
    related_application_id = Column(Integer, ForeignKey("task_applications.id"), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id])


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    company_name = Column(String(255), nullable=False)
    company_description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    website = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    established_year = Column(Integer, nullable=True)
    total_employees = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("User", foreign_keys=[company_id], backref="company_profile")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    bio = Column(Text, nullable=True)
    skills = Column(String, nullable=True)  # JSON string of skills
    experience_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    portfolio_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    preferred_work_type = Column(String(100), nullable=True)
    available_from = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("User", foreign_keys=[student_id], backref="student_profile")
