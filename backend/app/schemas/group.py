from pydantic import BaseModel
from typing import List
from datetime import datetime

class DiscussionMessageBase(BaseModel):
    content: str

class DiscussionMessageCreate(DiscussionMessageBase):
    pass

class DiscussionMessageResponse(DiscussionMessageBase):
    id: int
    author_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str
    description: str | None = None

class GroupCreate(GroupBase):
    pass

class GroupMemberResponse(BaseModel):
    user_id: int
    joined_at: datetime

    class Config:
        from_attributes = True

class GroupResponse(GroupBase):
    id: int
    created_at: datetime
    members: List[GroupMemberResponse] = []
    discussions: List[DiscussionMessageResponse] = []

    class Config:
        from_attributes = True

class GroupJoinResponse(BaseModel):
    message: str
