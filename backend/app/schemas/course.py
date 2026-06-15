from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List


class CourseCreate(BaseModel):
    title: str
    description: str
    price: float
    duration_hours: int
    level: str  # beginner, intermediate, advanced
    category: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 5:
            raise ValueError("Title must be at least 5 characters long")
        return clean

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 20:
            raise ValueError("Description must be at least 20 characters long")
        return clean

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("duration_hours")
    @classmethod
    def validate_duration(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Duration must be greater than 0")
        return v

    @field_validator("level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        if v not in ["beginner", "intermediate", "advanced"]:
            raise ValueError("Level must be beginner, intermediate, or advanced")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Category is required")
        return clean


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_hours: Optional[int] = None
    level: Optional[str] = None
    category: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        clean = v.strip()
        if len(clean) < 5:
            raise ValueError("Title must be at least 5 characters long")
        return clean

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        clean = v.strip()
        if len(clean) < 20:
            raise ValueError("Description must be at least 20 characters long")
        return clean

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return v
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("duration_hours")
    @classmethod
    def validate_duration(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v <= 0:
            raise ValueError("Duration must be greater than 0")
        return v

    @field_validator("level")
    @classmethod
    def validate_level(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in ["beginner", "intermediate", "advanced"]:
            raise ValueError("Level must be beginner, intermediate, or advanced")
        return v


class CourseResponse(BaseModel):
    id: int
    lecturer_id: int
    title: str
    description: str
    price: float
    duration_hours: int
    level: str
    category: str
    cover_image: Optional[str]
    created_at: datetime
    updated_at: datetime
    enrolled_count: int = 0
    is_enrolled: bool = False

    class Config:
        from_attributes = True


class CourseEnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    enrolled_at: datetime
    progress: float

    class Config:
        from_attributes = True
