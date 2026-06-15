from sqlalchemy import Column, String, DateTime, Enum, Integer
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class UserRole(str, enum.Enum):
    student = "student"
    lecturer = "lecturer"
    company = "company"
    tech_lead = "tech_lead"
    admin = "admin"


class AccessStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    pending = "pending"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_code = Column(String(20), unique=True, nullable=True, index=True)  # e.g. STD0001
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    description = Column(String, nullable=True)
    education_status = Column(String(100), nullable=True)
    # New fields
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    school = Column(String(200), nullable=True)   # School / University (students & lecturers)
    mobile = Column(String(15), nullable=True)     # Sri Lankan format: 0XXXXXXXXX
    cv_path = Column(String(500), nullable=True)   # Relative path to uploaded CV file
    avatar_path = Column(String(500), nullable=True)
    cover_path = Column(String(500), nullable=True)
    access_status = Column(Enum(AccessStatus), default=AccessStatus.pending)
    last_seen = deferred(Column(DateTime(timezone=True), nullable=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # -- relationships --#
    posts = relationship("Post", back_populates="user")
    likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    reposts = relationship("PostRepost", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="user", cascade="all, delete-orphan")
    following_relationships = relationship(
        "UserFollow",
        foreign_keys="UserFollow.follower_id",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    follower_relationships = relationship(
        "UserFollow",
        foreign_keys="UserFollow.following_id",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
