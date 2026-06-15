from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.db.database import get_db
from app.models.opportunity import (
    Opportunity, Task, TaskApplication, TaskSubmission, 
    Notification, CompanyProfile, StudentProfile,
    OpportunityStatus, ApplicationStatus, TaskStatus
)
from app.models.user import User, UserRole
from app.schemas.opportunity import (
    OpportunityCreate, OpportunityUpdate, OpportunityResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    TaskApplicationCreate, TaskApplicationUpdate, TaskApplicationResponse,
    TaskSubmissionCreate, TaskSubmissionUpdate, TaskSubmissionResponse,
    NotificationCreate, NotificationResponse,
    CompanyProfileCreate, CompanyProfileUpdate, CompanyProfileResponse,
    StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse,
    DashboardStats, CompanyDashboardResponse, StudentDashboardResponse
)
from app.utils.autho import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


# ==================== OPPORTUNITY ENDPOINTS ====================

@router.post("/", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    opportunity: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Create a new opportunity (Company only)"""
    user = db.query(User).filter(User.id == current_user).first()
    if not user or user.role != UserRole.company_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company admins can create opportunities"
        )

    new_opportunity = Opportunity(
        **opportunity.dict(),
        company_id=current_user
    )
    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)
    return new_opportunity


@router.get("/", response_model=List[OpportunityResponse])
def get_opportunities(
    skip: int = 0,
    limit: int = 10,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get all active opportunities"""
    query = db.query(Opportunity).filter(Opportunity.status == OpportunityStatus.active)
    
    if status_filter:
        query = query.filter(Opportunity.status == status_filter)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get opportunity by ID"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    return opportunity


@router.put("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Update opportunity (Company owner only)"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    if opportunity.company_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own opportunities"
        )
    
    update_data = opportunity_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opportunity, field, value)
    
    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Delete opportunity (Company owner only)"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    if opportunity.company_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own opportunities"
        )
    
    db.delete(opportunity)
    db.commit()


# ==================== TASK ENDPOINTS ====================

@router.post("/{opportunity_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    opportunity_id: int,
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Create a task for an opportunity"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    if opportunity.company_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create tasks for your opportunities"
        )
    
    new_task = Task(
        opportunity_id=opportunity_id,
        **task.dict()
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.get("/{opportunity_id}/tasks", response_model=List[TaskResponse])
def get_opportunity_tasks(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get all tasks for an opportunity"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    return db.query(Task).filter(Task.opportunity_id == opportunity_id).all()


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Update task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    opportunity = db.query(Opportunity).filter(Opportunity.id == task.opportunity_id).first()
    if opportunity.company_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your tasks"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task


# ==================== APPLICATION ENDPOINTS ====================

@router.post("/applications", response_model=TaskApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_for_opportunity(
    application: TaskApplicationCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Apply for an opportunity"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    # Check if already applied
    existing_application = db.query(TaskApplication).filter(
        and_(
            TaskApplication.opportunity_id == application.opportunity_id,
            TaskApplication.student_id == current_user
        )
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this opportunity"
        )
    
    # Check max applicants
    applicant_count = db.query(TaskApplication).filter(
        TaskApplication.opportunity_id == application.opportunity_id
    ).count()
    
    if applicant_count >= opportunity.max_applicants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum applicants reached for this opportunity"
        )
    
    new_application = TaskApplication(
        **application.dict(),
        student_id=current_user
    )
    db.add(new_application)
    
    # Create notification for company
    notification = Notification(
        recipient_id=opportunity.company_id,
        notification_type="application_received",
        title=f"New Application",
        message=f"New application received for {opportunity.title}",
        related_opportunity_id=opportunity.id,
        related_application_id=new_application.id
    )
    db.add(notification)
    
    db.commit()
    db.refresh(new_application)
    return new_application


@router.get("/applications/{opportunity_id}", response_model=List[TaskApplicationResponse])
def get_opportunity_applications(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get applications for an opportunity (Company owner only)"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    
    if opportunity.company_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view applications for your opportunities"
        )
    
    return db.query(TaskApplication).filter(
        TaskApplication.opportunity_id == opportunity_id
    ).all()


@router.put("/applications/{application_id}", response_model=TaskApplicationResponse)
def update_application_status(
    application_id: int,
    application_update: TaskApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Update application status"""
    application = db.query(TaskApplication).filter(TaskApplication.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    if opportunity.company_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update applications for your opportunities"
        )
    
    if application_update.status:
        application.status = application_update.status
        
        # Create notification for student
        status_map = {
            "shortlisted": "Shortlisted",
            "rejected": "Rejected",
            "accepted": "Accepted"
        }
        
        notification = Notification(
            recipient_id=application.student_id,
            notification_type="application_status",
            title=f"Application {status_map.get(application.status, 'Updated')}",
            message=f"Your application for {opportunity.title} has been {status_map.get(application.status, 'updated')}",
            related_opportunity_id=opportunity.id,
            related_application_id=application.id
        )
        db.add(notification)
    
    db.commit()
    db.refresh(application)
    return application


# ==================== SUBMISSION ENDPOINTS ====================

@router.post("/submissions", response_model=TaskSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_task(
    submission: TaskSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Submit a task"""
    task = db.query(Task).filter(Task.id == submission.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    new_submission = TaskSubmission(
        **submission.dict(),
        student_id=current_user
    )
    db.add(new_submission)
    
    # Notify company
    opportunity = db.query(Opportunity).filter(Opportunity.id == task.opportunity_id).first()
    notification = Notification(
        recipient_id=opportunity.company_id,
        notification_type="submission_received",
        title=f"Task Submitted",
        message=f"New submission for {task.title}",
        related_task_id=task.id
    )
    db.add(notification)
    
    db.commit()
    db.refresh(new_submission)
    return new_submission


@router.get("/submissions/task/{task_id}", response_model=List[TaskSubmissionResponse])
def get_task_submissions(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get submissions for a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return db.query(TaskSubmission).filter(TaskSubmission.task_id == task_id).all()


@router.put("/submissions/{submission_id}", response_model=TaskSubmissionResponse)
def update_submission(
    submission_id: int,
    submission_update: TaskSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Update task submission"""
    submission = db.query(TaskSubmission).filter(TaskSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    update_data = submission_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(submission, field, value)
    
    db.commit()
    db.refresh(submission)
    return submission


# ==================== DASHBOARD ENDPOINTS ====================

@router.get("/dashboard/company", response_model=CompanyDashboardResponse)
def company_dashboard(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get company dashboard data"""
    user = db.query(User).filter(User.id == current_user).first()
    if not user or user.role != UserRole.company_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company admins can access this dashboard"
        )
    
    total_posted = db.query(func.count(Opportunity.id)).filter(
        Opportunity.company_id == current_user
    ).scalar()
    
    active_opportunities = db.query(func.count(Opportunity.id)).filter(
        and_(
            Opportunity.company_id == current_user,
            Opportunity.status == OpportunityStatus.active
        )
    ).scalar()
    
    staged_tasks = db.query(func.count(Task.id)).filter(
        Task.status == TaskStatus.pending
    ).scalar()
    
    total_applicants = db.query(func.count(TaskApplication.id)).filter(
        TaskApplication.opportunity_id.in_(
            db.query(Opportunity.id).filter(Opportunity.company_id == current_user)
        )
    ).scalar()
    
    stats = DashboardStats(
        total_posted=total_posted or 0,
        active_opportunities=active_opportunities or 0,
        staged_tasks=staged_tasks or 0,
        total_applicants_reached=total_applicants or 0
    )
    
    opportunities = db.query(Opportunity).filter(
        Opportunity.company_id == current_user
    ).all()
    
    recent_applications = db.query(TaskApplication).filter(
        TaskApplication.opportunity_id.in_(
            db.query(Opportunity.id).filter(Opportunity.company_id == current_user)
        )
    ).order_by(TaskApplication.applied_at.desc()).limit(10).all()
    
    return CompanyDashboardResponse(
        stats=stats,
        opportunities=opportunities,
        recent_applications=recent_applications
    )


@router.get("/dashboard/student", response_model=StudentDashboardResponse)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get student dashboard data"""
    submitted_tasks = db.query(TaskSubmission).filter(
        TaskSubmission.student_id == current_user
    ).all()
    
    applied_opportunities = db.query(TaskApplication).filter(
        TaskApplication.student_id == current_user
    ).all()
    
    notifications = db.query(Notification).filter(
        Notification.recipient_id == current_user
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return StudentDashboardResponse(
        submitted_tasks=submitted_tasks,
        applied_opportunities=applied_opportunities,
        notifications=notifications
    )


# ==================== NOTIFICATION ENDPOINTS ====================

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get notifications for current user"""
    query = db.query(Notification).filter(Notification.recipient_id == current_user)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.recipient_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your notifications"
        )
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/notifications/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        and_(
            Notification.recipient_id == current_user,
            Notification.is_read == False
        )
    ).update({"is_read": True})
    db.commit()


# ==================== PROFILE ENDPOINTS ====================

@router.post("/profiles/company", response_model=CompanyProfileResponse, status_code=status.HTTP_201_CREATED)
def create_company_profile(
    profile: CompanyProfileCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Create company profile"""
    existing_profile = db.query(CompanyProfile).filter(
        CompanyProfile.company_id == current_user
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company profile already exists"
        )
    
    new_profile = CompanyProfile(
        company_id=current_user,
        **profile.dict()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@router.get("/profiles/company/{company_id}", response_model=CompanyProfileResponse)
def get_company_profile(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get company profile"""
    profile = db.query(CompanyProfile).filter(
        CompanyProfile.company_id == company_id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    return profile


@router.put("/profiles/company", response_model=CompanyProfileResponse)
def update_company_profile(
    profile_update: CompanyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Update company profile"""
    profile = db.query(CompanyProfile).filter(
        CompanyProfile.company_id == current_user
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/profiles/student", response_model=StudentProfileResponse, status_code=status.HTTP_201_CREATED)
def create_student_profile(
    profile: StudentProfileCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Create student profile"""
    existing_profile = db.query(StudentProfile).filter(
        StudentProfile.student_id == current_user
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile already exists"
        )
    
    new_profile = StudentProfile(
        student_id=current_user,
        **profile.dict()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@router.get("/profiles/student/{student_id}", response_model=StudentProfileResponse)
def get_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Get student profile"""
    profile = db.query(StudentProfile).filter(
        StudentProfile.student_id == student_id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return profile


@router.put("/profiles/student", response_model=StudentProfileResponse)
def update_student_profile(
    profile_update: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """Update student profile"""
    profile = db.query(StudentProfile).filter(
        StudentProfile.student_id == current_user
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile
