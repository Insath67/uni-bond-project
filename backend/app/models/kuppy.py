import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class KuppyRequestStatus(str, enum.Enum):
    open = "open"
    scheduled = "scheduled"
    completed = "completed"


class KuppyOfferStatus(str, enum.Enum):
    open = "open"
    selected = "selected"
    withdrawn = "withdrawn"


class KuppySessionStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    completed = "completed"
    cancelled = "cancelled"


class KuppyRequest(Base):
    __tablename__ = "kuppy_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    module_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requested_before = Column(DateTime(timezone=True), nullable=False)
    current_student_count = Column(Integer, nullable=False, default=1)
    status = Column(Enum(KuppyRequestStatus), nullable=False, default=KuppyRequestStatus.open)
    selected_offer_id = Column(Integer, ForeignKey("kuppy_offers.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    student = relationship("User", foreign_keys=[student_id])
    votes = relationship("KuppyRequestVote", back_populates="request", cascade="all, delete-orphan")
    offers = relationship(
        "KuppyOffer",
        back_populates="request",
        cascade="all, delete-orphan",
        foreign_keys="KuppyOffer.request_id",
    )
    selected_offer = relationship("KuppyOffer", foreign_keys=[selected_offer_id], post_update=True)
    session = relationship("KuppySession", back_populates="request", uselist=False)


class KuppyRequestVote(Base):
    __tablename__ = "kuppy_request_votes"
    __table_args__ = (UniqueConstraint("request_id", "user_id", name="uq_kuppy_request_vote_user"),)

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("kuppy_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    request = relationship("KuppyRequest", back_populates="votes")
    user = relationship("User")


class KuppyOffer(Base):
    __tablename__ = "kuppy_offers"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("kuppy_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    lecturer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    availability_start = Column(DateTime(timezone=True), nullable=False)
    availability_end = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(KuppyOfferStatus), nullable=False, default=KuppyOfferStatus.open)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    request = relationship("KuppyRequest", back_populates="offers", foreign_keys=[request_id])
    lecturer = relationship("User")


class KuppySession(Base):
    __tablename__ = "kuppy_session_events"

    id = Column(Integer, primary_key=True, index=True)
    lecturer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    request_id = Column(Integer, ForeignKey("kuppy_requests.id"), nullable=True, unique=True)
    title = Column(String(255), nullable=False)
    module_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    scheduled_start = Column(DateTime(timezone=True), nullable=False)
    scheduled_end = Column(DateTime(timezone=True), nullable=False)
    max_students = Column(Integer, nullable=False, default=1)
    status = Column(Enum(KuppySessionStatus), nullable=False, default=KuppySessionStatus.scheduled)
    auto_delete_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lecturer = relationship("User", foreign_keys=[lecturer_id])
    request = relationship("KuppyRequest", back_populates="session")
    participants = relationship("KuppyParticipant", back_populates="session", cascade="all, delete-orphan")


class KuppyParticipant(Base):
    __tablename__ = "kuppy_session_enrollments"
    __table_args__ = (UniqueConstraint("session_id", "user_id", name="uq_kuppy_session_participant"),)

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("kuppy_session_events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("KuppySession", back_populates="participants")
    user = relationship("User")
