from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime
from enum import Enum
from typing import Optional, List


class OpportunityStatus(str, Enum):
    draft = "draft"
    active = "active"
    closed = "closed"
    completed = "completed"


class OpportunityType(str, Enum):
    internship = "internship"
    freelance = "freelance"
    part_time = "part_time"
    full_time = "full_time"
    project = "project"
    task = "task"


class ApplicationStatus(str, Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    rejected = "rejected"
    accepted = "accepted"
    completed = "completed"


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    submitted = "submitted"
    reviewed = "reviewed"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"


class NotificationType(str, Enum):
    application_received = "application_received"
    application_status = "application_status"
    task_assigned = "task_assigned"
    submission_received = "submission_received"
    feedback_provided = "feedback_provided"


# ==================== Opportunity Schemas ====================


class OpportunityCreate(BaseModel):
    title: str
    description: str
    opportunity_type: OpportunityType
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    requirements: Optional[str] = None
    max_applicants: Optional[int] = 50
    deadline: Optional[datetime] = None


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    opportunity_type: Optional[OpportunityType] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    requirements: Optional[str] = None
    status: Optional[OpportunityStatus] = None
    max_applicants: Optional[int] = None
    deadline: Optional[datetime] = None


class OpportunityResponse(BaseModel):
    id: int
    title: str
    description: str
    opportunity_type: OpportunityType
    company_id: int
    location: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    requirements: Optional[str]
    status: OpportunityStatus
    max_applicants: int
    deadline: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Task Schemas ====================


class TaskCreate(BaseModel):
    opportunity_id: int
    title: str
    description: str
    stage: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    stage: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    opportunity_id: int
    title: str
    description: str
    status: TaskStatus
    stage: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Task Application Schemas ====================


class TaskApplicationCreate(BaseModel):
    opportunity_id: int
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None


class TaskApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None


class TaskApplicationResponse(BaseModel):
    id: int
    opportunity_id: int
    student_id: int
    status: ApplicationStatus
    cover_letter: Optional[str]
    resume_url: Optional[str]
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Task Submission Schemas ====================


class TaskSubmissionCreate(BaseModel):
    task_id: int
    submission_text: Optional[str] = None
    submission_url: Optional[str] = None


class TaskSubmissionUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    feedback: Optional[str] = None


class TaskSubmissionResponse(BaseModel):
    id: int
    task_id: int
    student_id: int
    submission_text: Optional[str]
    submission_url: Optional[str]
    status: TaskStatus
    feedback: Optional[str]
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Notification Schemas ====================


class NotificationCreate(BaseModel):
    recipient_id: int
    notification_type: NotificationType
    title: str
    message: str
    related_opportunity_id: Optional[int] = None
    related_task_id: Optional[int] = None
    related_application_id: Optional[int] = None


class NotificationResponse(BaseModel):
    id: int
    recipient_id: int
    notification_type: NotificationType
    title: str
    message: str
    related_opportunity_id: Optional[int]
    related_task_id: Optional[int]
    related_application_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Company Profile Schemas ====================


class CompanyProfileCreate(BaseModel):
    company_name: str
    company_description: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    established_year: Optional[int] = None
    total_employees: Optional[int] = None


class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    established_year: Optional[int] = None
    total_employees: Optional[int] = None


class CompanyProfileResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    company_description: Optional[str]
    industry: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    logo_url: Optional[str]
    established_year: Optional[int]
    total_employees: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Student Profile Schemas ====================


class StudentProfileCreate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_picture_url: Optional[str] = None
    preferred_work_type: Optional[str] = None
    available_from: Optional[datetime] = None


class StudentProfileUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_picture_url: Optional[str] = None
    preferred_work_type: Optional[str] = None
    available_from: Optional[datetime] = None


class StudentProfileResponse(BaseModel):
    id: int
    student_id: int
    bio: Optional[str]
    skills: Optional[str]
    experience_level: Optional[str]
    portfolio_url: Optional[str]
    github_url: Optional[str]
    linkedin_url: Optional[str]
    profile_picture_url: Optional[str]
    preferred_work_type: Optional[str]
    available_from: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Dashboard Schemas ====================


class DashboardStats(BaseModel):
    total_posted: int
    active_opportunities: int
    staged_tasks: int
    total_applicants_reached: int


class CompanyDashboardResponse(BaseModel):
    stats: DashboardStats
    opportunities: List[OpportunityResponse]
    recent_applications: List[TaskApplicationResponse]


class StudentDashboardResponse(BaseModel):
    submitted_tasks: List[TaskSubmissionResponse]
    applied_opportunities: List[TaskApplicationResponse]
    notifications: List[NotificationResponse]
