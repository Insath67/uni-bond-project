from datetime import datetime
import re
from typing import List, Literal

from pydantic import BaseModel, field_validator, model_validator


EMAIL_REGEX = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"


def _clean_string_list(values: List[str] | None) -> List[str]:
    if not values:
        return []
    return [item.strip() for item in values if isinstance(item, str) and item.strip()]


class TaskReadBase(BaseModel):
    title: str
    description: str = ""
    category: str = "General"
    project_type: Literal["Group", "Individual"] = "Individual"
    skills: List[str] = []
    technologies: List[str] = []
    experience_level: str = "Intermediate"
    students_needed: int = 1
    duration: str = ""
    start_date: str = ""
    deadline: str = ""
    stipend: str = ""
    certificate: bool = False
    internship_opportunity: bool = False
    tags: List[str] = []
    contact_email: str = ""
    status: Literal["open", "in_progress", "completed"] = "open"

    @field_validator("skills", "technologies", "tags")
    @classmethod
    def normalize_string_lists(cls, value: List[str]) -> List[str]:
        return _clean_string_list(value)

    @field_validator("title", "description", "category", "duration", "stipend", "contact_email")
    @classmethod
    def trim_text_fields(cls, value: str) -> str:
        return value.strip()


class TaskWriteBase(TaskReadBase):
    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        if len(value) < 5:
            raise ValueError("Task title must be at least 5 characters long")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        if len(value) < 20:
            raise ValueError("Task description must be at least 20 characters long")
        return value

    @field_validator("contact_email")
    @classmethod
    def validate_contact_email(cls, value: str) -> str:
        if not re.fullmatch(EMAIL_REGEX, value):
            raise ValueError("A valid contact email is required")
        return value.lower()

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, value: List[str]) -> List[str]:
        if not value:
            raise ValueError("At least one required skill must be provided")
        return value

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: List[str]) -> List[str]:
        for tag in value:
            if len(tag) < 2:
                raise ValueError("Each tag must contain at least 2 characters")
        return value

    @field_validator("students_needed")
    @classmethod
    def validate_students_needed(cls, value: int) -> int:
        if value < 1:
            raise ValueError("Students needed must be at least 1")
        return value

    @model_validator(mode="after")
    def validate_project_dates(self):
        if self.project_type == "Group" and self.students_needed < 2:
            raise ValueError("Group projects must request at least 2 students")

        if self.start_date and self.deadline:
            try:
                start_date = datetime.fromisoformat(self.start_date.replace("Z", "+00:00"))
                deadline_date = datetime.fromisoformat(self.deadline.replace("Z", "+00:00"))
            except ValueError as exc:
                raise ValueError("Start date and deadline must be valid ISO dates") from exc

            if deadline_date <= start_date:
                raise ValueError("Deadline must be after the start date")

        return self


class TaskCreate(TaskWriteBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    project_type: Literal["Group", "Individual"] | None = None
    skills: List[str] | None = None
    technologies: List[str] | None = None
    experience_level: str | None = None
    students_needed: int | None = None
    duration: str | None = None
    start_date: str | None = None
    deadline: str | None = None
    stipend: str | None = None
    certificate: bool | None = None
    internship_opportunity: bool | None = None
    tags: List[str] | None = None
    contact_email: str | None = None
    status: Literal["open", "in_progress", "completed"] | None = None

    @field_validator("title", "description", "category", "duration", "stipend", "contact_email")
    @classmethod
    def trim_optional_text_fields(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("skills", "technologies", "tags")
    @classmethod
    def normalize_optional_string_lists(cls, value: List[str] | None) -> List[str] | None:
        if value is None:
            return value
        return _clean_string_list(value)

    @model_validator(mode="after")
    def validate_partial_update(self):
        if self.title is not None and len(self.title) < 5:
            raise ValueError("Task title must be at least 5 characters long")

        if self.description is not None and len(self.description) < 20:
            raise ValueError("Task description must be at least 20 characters long")

        if self.contact_email is not None and not re.fullmatch(EMAIL_REGEX, self.contact_email):
            raise ValueError("A valid contact email is required")

        if self.skills is not None and not self.skills:
            raise ValueError("At least one required skill must be provided")

        if self.tags is not None:
            for tag in self.tags:
                if len(tag) < 2:
                    raise ValueError("Each tag must contain at least 2 characters")

        if self.students_needed is not None and self.students_needed < 1:
            raise ValueError("Students needed must be at least 1")

        if self.project_type == "Group" and self.students_needed is not None and self.students_needed < 2:
            raise ValueError("Group projects must request at least 2 students")

        if self.start_date and self.deadline:
            try:
                start_date = datetime.fromisoformat(self.start_date.replace("Z", "+00:00"))
                deadline_date = datetime.fromisoformat(self.deadline.replace("Z", "+00:00"))
            except ValueError as exc:
                raise ValueError("Start date and deadline must be valid ISO dates") from exc

            if deadline_date <= start_date:
                raise ValueError("Deadline must be after the start date")

        return self


class TaskApplicantResponse(BaseModel):
    id: int
    user_id: int
    student_name: str
    email: str
    status: Literal["pending", "accepted", "rejected"] = "pending"
    portfolio_url: str | None = None
    cover_letter: str | None = None
    applied_at: datetime

    class Config:
        from_attributes = True


class TaskResponse(TaskReadBase):
    id: int
    company_id: int
    company_name: str
    created_at: datetime
    applicants: List[TaskApplicantResponse] = []

    class Config:
        from_attributes = True


class TaskApplyRequest(BaseModel):
    portfolio_url: str | None = None
    cover_letter: str | None = None
    email: str | None = None
