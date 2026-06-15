from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime
from enum import Enum
from typing import Optional
import re


class UserRole(str, Enum):
    student = "student"
    lecturer = "lecturer"
    company = "company"
    tech_lead = "tech_lead"
    admin = "admin"


class AccessStatus(str, Enum):
    active = "active"
    suspended = "suspended"
    pending = "pending"


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str
    role: UserRole
    description: Optional[str] = None
    education_status: Optional[str] = None
    # New fields
    city: str
    country: str
    school: Optional[str] = None   # Required for student / lecturer
    mobile: str

    @field_validator("first_name", "last_name", "username", "city", "country")
    @classmethod
    def validate_required_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("This field is required")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return clean

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        """Sri Lankan mobile: 10 digits starting with 0 (e.g. 0775078338)"""
        clean = v.strip()
        if not re.fullmatch(r"0\d{9}", clean):
            raise ValueError(
                "Mobile must be 10 digits and start with 0 (e.g. 0775078338)"
            )
        return clean


class UserResponse(BaseModel):
    id: int
    user_code: Optional[str]
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    role: UserRole
    description: Optional[str]
    education_status: Optional[str]
    city: Optional[str]
    country: Optional[str]
    school: Optional[str]
    mobile: Optional[str]
    cv_path: Optional[str]
    avatar_path: Optional[str] = None
    cover_path: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    industry_expertise: Optional[str] = None
    years_of_experience: Optional[str] = None
    access_status: AccessStatus
    created_at: datetime

    class Config:
        from_attributes = True


class UserDiscoverResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: UserRole
    city: Optional[str]
    country: Optional[str]
    avatar_path: Optional[str] = None
    is_following: bool = False

    class Config:
        from_attributes = True


class FollowStatusResponse(BaseModel):
    is_following: bool


class UserSummaryResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: UserRole
    city: Optional[str]
    country: Optional[str]
    avatar_path: Optional[str] = None
    is_following: bool = False

    class Config:
        from_attributes = True


class OnlineUserResponse(UserSummaryResponse):
    last_seen: Optional[datetime]
    is_online: bool


class UserProfileResponse(BaseModel):
    id: int
    user_code: Optional[str]
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    role: UserRole
    description: Optional[str]
    education_status: Optional[str]
    city: Optional[str]
    country: Optional[str]
    school: Optional[str]
    mobile: Optional[str]
    cv_path: Optional[str]
    avatar_path: Optional[str] = None
    cover_path: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    industry_expertise: Optional[str] = None
    years_of_experience: Optional[str] = None
    access_status: AccessStatus
    created_at: datetime
    followers_count: int
    following_count: int
    is_following: bool
    is_own_profile: bool


class UserStatusUpdate(BaseModel):
    access_status: AccessStatus


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    description: Optional[str] = None
    education_status: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    school: Optional[str] = None
    mobile: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    industry_expertise: Optional[str] = None
    years_of_experience: Optional[str] = None

    @field_validator("first_name", "last_name", "username", "city", "country", "school", "description", "education_status", "company_name", "industry", "company_size", "industry_expertise", "years_of_experience")
    @classmethod
    def normalize_optional_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        clean = value.strip()
        return clean or None

    @field_validator("password")
    @classmethod
    def validate_optional_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        clean = value.strip()
        if len(clean) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return clean

    @field_validator("mobile")
    @classmethod
    def validate_optional_mobile(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        clean = value.strip()
        if not re.fullmatch(r"0\d{9}", clean):
            raise ValueError("Mobile must be 10 digits and start with 0 (e.g. 0775078338)")
        return clean

    @model_validator(mode="after")
    def validate_role_specific_fields(self):
        role = self.role

        if role in (UserRole.student, UserRole.lecturer):
            if self.school is not None and not self.school:
                raise ValueError("School/University is required for students and lecturers.")
            if self.education_status is not None and not self.education_status:
                raise ValueError("Education level is required for students and lecturers.")

        if role == UserRole.company:
            if self.company_name is not None and not self.company_name:
                raise ValueError("Company name is required for company users.")

        if role == UserRole.tech_lead and self.years_of_experience is not None:
            if not self.years_of_experience.isdigit():
                raise ValueError("Years of experience must be a valid whole number.")

        return self
