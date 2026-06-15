from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ProfessionalSession(Base):
    __tablename__ = "professional_sessions_v2"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    speaker = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    session_date = Column(Date, nullable=False)
    session_time = Column(String(20), nullable=False)
    zoom_link = Column(String(1000), nullable=False)
    seat_count = Column(Integer, nullable=False, default=30)
    tags_csv = Column(String(1000), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    creator = relationship("User")
    registrations = relationship(
        "ProfessionalSessionRegistration",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class ProfessionalSessionRegistration(Base):
    __tablename__ = "professional_session_registrations_v2"
    __table_args__ = (
        UniqueConstraint("session_id", "student_id", name="uq_prof_session_student_v2"),
    )

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("professional_sessions_v2.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("ProfessionalSession", back_populates="registrations")
    student = relationship("User")
