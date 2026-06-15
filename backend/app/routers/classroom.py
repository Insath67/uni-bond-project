from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.classroom import Classroom, ClassroomStudent
from app.schemas.classroom import ClassroomCreate, ClassroomResponse, ClassroomJoinResponse
from app.models.user import User
from app.utils.autho import get_current_user

router = APIRouter(prefix="/classrooms", tags=["Classrooms"])

@router.post("/", response_model=ClassroomResponse)
def create_classroom(classroom: ClassroomCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "lecturer" and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only lecturers can create classrooms")
        
    db_classroom = Classroom(
        tech_lead_id=current_user.id,
        title=classroom.title,
        description=classroom.description,
        max_students=classroom.max_students
    )
    db.add(db_classroom)
    db.commit()
    db.refresh(db_classroom)
    return db_classroom

@router.get("/", response_model=List[ClassroomResponse])
def get_all_classrooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Wait, frontend displays techLeadName. Pydantic might need that resolver if we matched frontend 1:1, but right now we match our backend schema
    classrooms = db.query(Classroom).order_by(Classroom.created_at.desc()).all()
    return classrooms

@router.get("/{classroom_id}", response_model=ClassroomResponse)
def get_classroom(classroom_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classroom not found")
    return classroom

@router.post("/{classroom_id}/join", response_model=ClassroomJoinResponse)
def join_classroom(classroom_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can apply to join classrooms")
        
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classroom not found")
        
    # Check max students
    enrolled_count = db.query(ClassroomStudent).filter(ClassroomStudent.classroom_id == classroom_id).count()
    if enrolled_count >= classroom.max_students:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Classroom is full")
        
    existing_enrollee = db.query(ClassroomStudent).filter(ClassroomStudent.classroom_id == classroom_id, ClassroomStudent.user_id == current_user.id).first()
    if existing_enrollee:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already enrolled")
        
    enrollee = ClassroomStudent(classroom_id=classroom_id, user_id=current_user.id)
    db.add(enrollee)
    db.commit()
    return {"message": "Successfully enrolled in classroom"}
