from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class TaskItem(Base): 
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True) # comma separated
    salary_or_reward = Column(String(255), nullable=True)
    deadline = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("User")
    applicants = relationship("TaskApplicant", back_populates="task", cascade="all, delete-orphan")

class TaskApplicant(Base):
    __tablename__ = "task_applicants"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("TaskItem", back_populates="applicants")
    user = relationship("User")
