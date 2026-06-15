from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.config import settings


SearchEntityType = Literal["user", "post", "group", "notice", "task"]


class SearchResultResponse(BaseModel):
    id: str
    type: SearchEntityType
    title: str
    description: str
    subtitle: str | None = None
    href: str
    avatar: str | None = None
    created_at: datetime | None = None
    is_study_related: bool = False


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResultResponse]


class SmartSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=300)
    top_k: int = Field(
        default=settings.smart_search_default_top_k,
        ge=1,
        le=settings.smart_search_max_top_k,
    )

    @field_validator("query")
    @classmethod
    def validate_query(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Query cannot be empty or whitespace only.")
        if len(cleaned_value) < settings.smart_search_min_query_length:
            raise ValueError(
                f"Query must be at least {settings.smart_search_min_query_length} characters long."
            )
        return cleaned_value


class SearchablePost(BaseModel):
    id: int
    title: str
    content: str
    author_name: str
    created_at: datetime

    @field_validator("title", "content", "author_name")
    @classmethod
    def validate_non_empty_text(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Post fields cannot be empty.")
        return cleaned_value


class IndexedPostResponse(SearchablePost):
    searchable_text: str


class SmartSearchResultItem(BaseModel):
    rank: int
    post_id: int
    title: str
    content_preview: str
    author_name: str
    similarity_score: float
    created_at: datetime


class SmartSearchResponse(BaseModel):
    query: str
    total_results: int
    results: list[SmartSearchResultItem]


class SearchIndexRebuildResponse(BaseModel):
    status: str
    message: str
    indexed_posts: int
    embedding_dimension: int
    index_path: str
    metadata_path: str
