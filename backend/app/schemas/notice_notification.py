from pydantic import BaseModel
from typing import List
from datetime import datetime

class NoticeBase(BaseModel):
    title: str
    content: str
    type: str | None = "general"
    is_pinned: bool = False

class NoticeCreate(NoticeBase):
    pass

class NoticeResponse(NoticeBase):
    id: int
    author_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    type: str
    message: str
    related_id: str | None = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationSummaryResponse(BaseModel):
    total_count: int
    unread_count: int
