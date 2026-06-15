from pydantic import BaseModel, field_validator
from typing import List
from datetime import datetime

class ClassroomBase(BaseModel):
    title: str
    description: str | None = None
    max_students: int = 50

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        clean = value.strip()
        if len(clean) < 5:
            raise ValueError("Classroom title must be at least 5 characters long")
        return clean

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        if value is None:
            return value
        clean = value.strip()
        if len(clean) < 20:
            raise ValueError("Classroom description must be at least 20 characters long")
        return clean

    @field_validator("max_students")
    @classmethod
    def validate_max_students(cls, value: int) -> int:
        if value < 1 or value > 500:
            raise ValueError("Maximum students must be between 1 and 500")
        return value

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomStudentResponse(BaseModel):
    user_id: int
    joined_at: datetime

    class Config:
        from_attributes = True

class ClassroomResponse(ClassroomBase):
    id: int
    tech_lead_id: int
    rating: int
    total_ratings: int
    created_at: datetime
    enrolled_students: List[ClassroomStudentResponse] = []

    class Config:
        from_attributes = True

class ClassroomJoinResponse(BaseModel):
    message: str
