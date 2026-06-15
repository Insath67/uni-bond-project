from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.course import Course, CourseEnrollment
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseEnrollmentResponse
from app.utils.autho import get_current_user
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/courses", tags=["Courses"])


def build_course_response(course: Course, current_user: User | None = None) -> CourseResponse:
    enrolled_count = len(course.enrollments)
    is_enrolled = False
    if current_user:
        is_enrolled = any(reg.student_id == current_user.id for reg in course.enrollments)
    
    return CourseResponse(
        id=course.id,
        lecturer_id=course.lecturer_id,
        title=course.title,
        description=course.description,
        price=course.price,
        duration_hours=course.duration_hours,
        level=course.level,
        category=course.category,
        cover_image=course.cover_image,
        created_at=course.created_at,
        updated_at=course.updated_at,
        enrolled_count=enrolled_count,
        is_enrolled=is_enrolled,
    )


# --- GET All Courses ---
@router.get("/", response_model=List[CourseResponse])
def get_all_courses(
    category: str | None = Query(default=None),
    level: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Course).order_by(desc(Course.created_at))
    
    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    
    courses = query.all()
    return [build_course_response(course, current_user) for course in courses]


# --- CREATE Course (Lecturer/Admin only) ---
@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.lecturer, UserRole.tech_lead, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lecturers can create courses"
        )
    
    new_course = Course(
        lecturer_id=current_user.id,
        title=course.title,
        description=course.description,
        price=course.price,
        duration_hours=course.duration_hours,
        level=course.level,
        category=course.category,
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    return build_course_response(new_course, current_user)


# --- GET Single Course ---
@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    return build_course_response(course, current_user)


# --- UPDATE Course (Creator/Admin only) ---
@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if current_user.role != UserRole.admin and course.lecturer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this course")
    
    if course_update.title is not None:
        course.title = course_update.title
    if course_update.description is not None:
        course.description = course_update.description
    if course_update.price is not None:
        course.price = course_update.price
    if course_update.duration_hours is not None:
        course.duration_hours = course_update.duration_hours
    if course_update.level is not None:
        course.level = course_update.level
    if course_update.category is not None:
        course.category = course_update.category
    
    course.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(course)
    
    return build_course_response(course, current_user)


# --- DELETE Course (Creator/Admin only) ---
@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if current_user.role != UserRole.admin and course.lecturer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this course")
    
    db.delete(course)
    db.commit()
    return None


# --- ENROLL in Course (Student only) ---
@router.post("/{course_id}/enroll", response_model=CourseEnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can enroll in courses"
        )
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Check if already enrolled
    existing_enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already enrolled in this course"
        )
    
    enrollment = CourseEnrollment(
        course_id=course_id,
        student_id=current_user.id,
    )
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    
    return CourseEnrollmentResponse.from_orm(enrollment)


# --- GET Enrolled Courses (Student) ---
@router.get("/student/my-courses", response_model=List[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their courses"
        )
    
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.student_id == current_user.id).all()
    courses = [enrollment.course for enrollment in enrollments]
    
    return [build_course_response(course, current_user) for course in courses]


# --- GET My Created Courses (Lecturer) ---
@router.get("/lecturer/my-courses", response_model=List[CourseResponse])
def get_my_created_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.lecturer, UserRole.tech_lead, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lecturers can view their created courses"
        )
    
    courses = db.query(Course).filter(Course.lecturer_id == current_user.id).order_by(desc(Course.created_at)).all()
    
    return [build_course_response(course, current_user) for course in courses]


# --- GET Course Enrollees (Lecturer/Admin only) ---
@router.get("/{course_id}/students", response_model=List[CourseEnrollmentResponse])
def get_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if current_user.role != UserRole.admin and course.lecturer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view course students"
        )
    
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).all()
    
    return [CourseEnrollmentResponse.from_orm(enrollment) for enrollment in enrollments]
