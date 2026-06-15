from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class PostMedia(Base):
    __tablename__ = "post_media"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    media_url = Column(String, nullable=False)
    media_type = Column(String, nullable=False)  # "image" or "video"

    
    #--relationship --#
    post = relationship("Post", back_populates="media")
