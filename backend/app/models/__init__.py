from app.db.base import Base

from app.models.user import User
from app.models.post import Post
from app.models.post_media import PostMedia 
from app.models.group import Group, GroupMember, DiscussionMessage
from app.models.kuppy import (
    KuppyOffer,
    KuppyParticipant,
    KuppyRequest,
    KuppyRequestVote,
    KuppySession,
)
from app.models.classroom import Classroom, ClassroomStudent
from app.models.task import TaskItem, TaskApplicant
from app.models.notice_notification import Notice, Notification
from app.models.interaction import PostLike, PostRepost, PostComment
from app.models.user_follow import UserFollow
from app.models.opportunity import (
    Opportunity,
    Task,
    TaskApplication,
    TaskSubmission,
    CompanyProfile,
    StudentProfile,
)
from app.models.professional_session import ProfessionalSession, ProfessionalSessionRegistration
from app.models.course import Course, CourseEnrollment
