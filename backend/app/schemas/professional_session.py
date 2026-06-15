from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class ProfessionalSessionCreate(BaseModel):
    title: str
    description: str
    session_date: date
    session_time: str
    zoom_link: str
    seat_count: int
    tags: List[str] = []

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 5:
            raise ValueError("Title must be at least 5 characters")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 15:
            raise ValueError("Description must be at least 15 characters")
        return value

    @field_validator("session_time")
    @classmethod
    def validate_session_time(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 4:
            raise ValueError("Invalid session time")
        return value

    @field_validator("zoom_link")
    @classmethod
    def validate_zoom_link(cls, value: str) -> str:
        value = value.strip()
        if not value.startswith("http://") and not value.startswith("https://"):
            raise ValueError("Zoom link must start with http:// or https://")
        return value

    @field_validator("seat_count")
    @classmethod
    def validate_seat_count(cls, value: int) -> int:
        if value < 1 or value > 1000:
            raise ValueError("Seat count must be between 1 and 1000")
        return value


class ProfessionalSessionUserSummary(BaseModel):
    id: str
    full_name: str
    email: str


class ProfessionalSessionAttendee(BaseModel):
    student_id: str
    student_name: str
    student_email: str
    registered_at: datetime


class ProfessionalSessionResponse(BaseModel):
    id: int
    title: str
    speaker: str
    description: str
    session_date: date
    session_time: str
    seat_count: int
    available_seats: int
    registered_count: int
    tags: List[str]
    creator_id: str
    is_registered: bool
    zoom_link: Optional[str] = None


class ProfessionalSessionRegisterResponse(BaseModel):
    message: str


class ProfessionalSessionAttendeesResponse(BaseModel):
    session_id: int
    attendees: List[ProfessionalSessionAttendee]
