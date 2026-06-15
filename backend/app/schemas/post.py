from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.schemas.moderation import ModerationCheckResponse

#-- Base model schemas for Post and PostMedia --#
#-- Request schemas --#
class PostMediaBase(BaseModel):
    media_url: str
    media_type: str


class PostCreate(BaseModel):
    content: Optional[str] = None
    media: Optional[List[PostMediaBase]] = []
    
    

#-- Response schemas --#        
class PostMediaResponse(PostMediaBase):
    id: int

    class Config:
        from_attributes = True


class PostUserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    role: str
    avatar_path: Optional[str] = None

    class Config:
        from_attributes = True


class PostCommentCreate(BaseModel):
    content: str


class PostCommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user: PostUserResponse

    class Config:
        from_attributes = True


class PostInteractionToggleResponse(BaseModel):
    status: str
    count: int


class PostResponse(BaseModel):
    id: int
    content: str | None
    created_at: datetime
    user_id: int
    user: PostUserResponse
    media: List[PostMediaResponse] = []
    
    # Intreaction metadata
    likes_count: int = 0
    reposts_count: int = 0
    comments_count: int = 0
    is_liked_by_user: bool = False
    is_reposted_by_user: bool = False
    comments: List[PostCommentResponse] = []

    class Config:
        from_attributes = True


class PostCreateWithModerationResponse(BaseModel):
    message: str
    moderation: ModerationCheckResponse
    post: PostResponse
