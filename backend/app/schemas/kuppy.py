from datetime import datetime, timedelta
from typing import List, Optional

from pydantic import BaseModel, field_validator, model_validator

from app.models.kuppy import KuppyOfferStatus, KuppyRequestStatus, KuppySessionStatus


def _clean_text(value: str, field_name: str, min_length: int) -> str:
    clean = value.strip()
    if len(clean) < min_length:
        raise ValueError(f"{field_name} must be at least {min_length} characters long")
    return clean


class KuppyUserSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    role: str

    class Config:
        from_attributes = True


class KuppyRequestCreate(BaseModel):
    module_name: str
    description: str
    requested_before: datetime
    current_student_count: int

    @field_validator("module_name")
    @classmethod
    def validate_module_name(cls, value: str) -> str:
        return _clean_text(value, "Module name", 3)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        return _clean_text(value, "Description", 15)

    @field_validator("requested_before")
    @classmethod
    def validate_requested_before(cls, value: datetime) -> datetime:
        now = datetime.now(value.tzinfo) if value.tzinfo else datetime.utcnow()
        if value <= now:
            raise ValueError("Requested before date must be in the future")
        return value

    @field_validator("current_student_count")
    @classmethod
    def validate_student_count(cls, value: int) -> int:
        if value < 1 or value > 500:
            raise ValueError("Current student count must be between 1 and 500")
        return value


class KuppyOfferCreate(BaseModel):
    availability_start: datetime
    availability_end: datetime
    description: str

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        return _clean_text(value, "Offer description", 10)

    @model_validator(mode="after")
    def validate_time_window(self):
        start = self.availability_start
        end = self.availability_end
        now = datetime.now(start.tzinfo) if start.tzinfo else datetime.utcnow()

        if start <= now:
            raise ValueError("Availability start must be in the future")
        if end <= start:
            raise ValueError("Availability end must be after the start time")
        if end - start < timedelta(minutes=30):
            raise ValueError("Availability slot must be at least 30 minutes long")
        return self


class KuppySessionCreate(BaseModel):
    title: str
    module_name: str
    description: str
    scheduled_start: datetime
    scheduled_end: datetime
    max_students: int

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        return _clean_text(value, "Title", 5)

    @field_validator("module_name")
    @classmethod
    def validate_module_name(cls, value: str) -> str:
        return _clean_text(value, "Module name", 3)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        return _clean_text(value, "Description", 15)

    @field_validator("max_students")
    @classmethod
    def validate_max_students(cls, value: int) -> int:
        if value < 1 or value > 500:
            raise ValueError("Maximum students must be between 1 and 500")
        return value

    @model_validator(mode="after")
    def validate_schedule(self):
        start = self.scheduled_start
        end = self.scheduled_end
        now = datetime.now(start.tzinfo) if start.tzinfo else datetime.utcnow()

        if start <= now:
            raise ValueError("Session start time must be in the future")
        if end <= start:
            raise ValueError("Session end time must be after the start time")
        if end - start < timedelta(minutes=30):
            raise ValueError("Session duration must be at least 30 minutes")
        return self


class KuppyRequestVoteResponse(BaseModel):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class KuppyOfferResponse(BaseModel):
    id: int
    request_id: int
    lecturer_id: int
    availability_start: datetime
    availability_end: datetime
    description: str
    status: KuppyOfferStatus
    created_at: datetime
    lecturer: KuppyUserSummary

    class Config:
        from_attributes = True


class KuppyParticipantResponse(BaseModel):
    user_id: int
    joined_at: datetime
    user: KuppyUserSummary

    class Config:
        from_attributes = True


class KuppyRequestResponse(BaseModel):
    id: int
    student_id: int
    module_name: str
    description: str
    requested_before: datetime
    current_student_count: int
    status: KuppyRequestStatus
    selected_offer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    student: KuppyUserSummary
    votes: List[KuppyRequestVoteResponse] = []
    offers: List[KuppyOfferResponse] = []

    class Config:
        from_attributes = True


class KuppySessionResponse(BaseModel):
    id: int
    lecturer_id: int
    request_id: Optional[int] = None
    title: str
    module_name: str
    description: str
    scheduled_start: datetime
    scheduled_end: datetime
    max_students: int
    status: KuppySessionStatus
    auto_delete_at: Optional[datetime] = None
    created_at: datetime
    lecturer: KuppyUserSummary
    participants: List[KuppyParticipantResponse] = []

    class Config:
        from_attributes = True


class KuppyJoinResponse(BaseModel):
    message: str
