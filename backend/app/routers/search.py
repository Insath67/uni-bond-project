from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.group import Group
from app.models.notice_notification import Notice
from app.models.post import Post
from app.models.task import TaskItem
from app.models.user import User
from app.schemas.search import (
    IndexedPostResponse,
    SearchIndexRebuildResponse,
    SearchResponse,
    SearchResultResponse,
    SmartSearchRequest,
    SmartSearchResponse,
)
from app.services.smart_search_service import smart_search_service
from app.utils.autho import get_current_user


router = APIRouter(prefix="/search", tags=["Search"])
semantic_router = APIRouter(prefix="/api/v1/search", tags=["Smart Search"])

STUDY_KEYWORDS = {
    "study",
    "university",
    "lecture",
    "lecturer",
    "education",
    "assignment",
    "exam",
    "module",
    "class",
    "classroom",
    "tutorial",
    "course",
    "academic",
    "research",
    "kuppy",
}


def _build_avatar(first_name: str, last_name: str, email: str) -> str:
    label = f"{first_name} {last_name}".strip() or email or "UniBond"
    return f"https://ui-avatars.com/api/?name={label.replace(' ', '+')}&background=e5e7eb&color=374151"


def _is_study_related(*values: str | None) -> bool:
    haystack = " ".join(value for value in values if value).lower()
    return any(keyword in haystack for keyword in STUDY_KEYWORDS)


def _score_result(query_lower: str, result: SearchResultResponse) -> tuple[int, float]:
    searchable = " ".join(
        part for part in [result.title, result.description, result.subtitle or ""] if part
    ).lower()

    if searchable == query_lower:
        rank = 0
    elif result.title.lower() == query_lower:
        rank = 1
    elif result.title.lower().startswith(query_lower):
        rank = 2
    elif query_lower in result.title.lower():
        rank = 3
    elif query_lower in searchable:
        rank = 4
    else:
        rank = 5

    created_at = result.created_at.timestamp() if result.created_at else 0.0
    return rank, -created_at


def _search_users(db: Session, query: str, limit: int) -> list[SearchResultResponse]:
    filters = [
        User.first_name.ilike(f"%{query}%"),
        User.last_name.ilike(f"%{query}%"),
        User.email.ilike(f"%{query}%"),
        User.username.ilike(f"%{query}%"),
        User.user_code.ilike(f"%{query}%"),
        User.school.ilike(f"%{query}%"),
        User.city.ilike(f"%{query}%"),
        User.country.ilike(f"%{query}%"),
        User.description.ilike(f"%{query}%"),
    ]
    users = (
        db.query(User)
        .filter(User.access_status == "active")
        .filter(or_(*filters))
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        SearchResultResponse(
            id=str(user.id),
            type="user",
            title=f"{user.first_name} {user.last_name}".strip(),
            description=user.description or user.email,
            subtitle=f"{user.role.value.replace('_', ' ').title()} • {', '.join(part for part in [user.city, user.country] if part) or 'UniBond member'}",
            href=f"/profile/{user.id}",
            avatar=_build_avatar(user.first_name, user.last_name, user.email),
            created_at=user.created_at,
            is_study_related=user.role.value in {"student", "lecturer"} or _is_study_related(user.school, user.description),
        )
        for user in users
    ]


def _search_posts(db: Session, query: str, limit: int) -> list[SearchResultResponse]:
    posts = (
        db.query(Post)
        .join(User, Post.user_id == User.id)
        .filter(
            or_(
                Post.content.ilike(f"%{query}%"),
                User.first_name.ilike(f"%{query}%"),
                User.last_name.ilike(f"%{query}%"),
            )
        )
        .order_by(Post.created_at.desc())
        .limit(limit)
        .all()
    )

    results: list[SearchResultResponse] = []
    for post in posts:
        author_name = f"{post.user.first_name} {post.user.last_name}".strip() if post.user else "UniBond user"
        content = (post.content or "").strip()
        results.append(
            SearchResultResponse(
                id=str(post.id),
                type="post",
                title=content[:72] + ("..." if len(content) > 72 else "") if content else f"Post by {author_name}",
                description=content[:180] + ("..." if len(content) > 180 else "") if content else "Shared a post on UniBond.",
                subtitle=f"Post by {author_name}",
                href="/",
                created_at=post.created_at,
                is_study_related=_is_study_related(content, author_name),
            )
        )
    return results


def _search_groups(db: Session, query: str, limit: int) -> list[SearchResultResponse]:
    groups = (
        db.query(Group)
        .filter(or_(Group.name.ilike(f"%{query}%"), Group.description.ilike(f"%{query}%")))
        .order_by(Group.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        SearchResultResponse(
            id=str(group.id),
            type="group",
            title=group.name,
            description=(group.description or "UniBond group")[:180],
            subtitle=f"{len(group.members)} members • {len(group.discussions)} discussions",
            href=f"/groups/{group.id}",
            created_at=group.created_at,
            is_study_related=_is_study_related(group.name, group.description),
        )
        for group in groups
    ]


def _search_notices(db: Session, query: str, limit: int) -> list[SearchResultResponse]:
    notices = (
        db.query(Notice)
        .filter(
            or_(
                Notice.title.ilike(f"%{query}%"),
                Notice.content.ilike(f"%{query}%"),
                Notice.type.ilike(f"%{query}%"),
            )
        )
        .order_by(Notice.is_pinned.desc(), Notice.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        SearchResultResponse(
            id=str(notice.id),
            type="notice",
            title=notice.title,
            description=notice.content[:180] + ("..." if len(notice.content) > 180 else ""),
            subtitle=f"{(notice.type or 'general').title()} notice",
            href="/notices",
            created_at=notice.created_at,
            is_study_related=notice.type in {"official", "department"} or _is_study_related(notice.title, notice.content, notice.type),
        )
        for notice in notices
    ]


def _search_tasks(db: Session, query: str, limit: int) -> list[SearchResultResponse]:
    tasks = (
        db.query(TaskItem)
        .join(User, TaskItem.company_id == User.id)
        .filter(
            or_(
                TaskItem.title.ilike(f"%{query}%"),
                TaskItem.description.ilike(f"%{query}%"),
                TaskItem.requirements.ilike(f"%{query}%"),
                TaskItem.salary_or_reward.ilike(f"%{query}%"),
                User.first_name.ilike(f"%{query}%"),
                User.last_name.ilike(f"%{query}%"),
            )
        )
        .order_by(TaskItem.created_at.desc())
        .limit(limit)
        .all()
    )

    results: list[SearchResultResponse] = []
    for task in tasks:
        company_name = f"{task.company.first_name} {task.company.last_name}".strip() if task.company else "Company"
        results.append(
            SearchResultResponse(
                id=str(task.id),
                type="task",
                title=task.title,
                description=(task.description or "Company opportunity")[:180],
                subtitle=f"Task by {company_name}",
                href=f"/tasks/{task.id}",
                created_at=task.created_at,
                is_study_related=_is_study_related(task.title, task.description, task.requirements),
            )
        )
    return results


@router.get("/", response_model=SearchResponse)
def search_all(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(8, ge=1, le=25),
    types: list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user

    normalized_query = q.strip()
    normalized_types = {item.strip().lower() for item in types if item.strip()}

    collectors: list[list[SearchResultResponse]] = []
    if not normalized_types or "user" in normalized_types:
        collectors.append(_search_users(db, normalized_query, limit))
    if not normalized_types or "post" in normalized_types:
        collectors.append(_search_posts(db, normalized_query, limit))
    if not normalized_types or "group" in normalized_types:
        collectors.append(_search_groups(db, normalized_query, limit))
    if not normalized_types or "notice" in normalized_types:
        collectors.append(_search_notices(db, normalized_query, limit))
    if not normalized_types or "task" in normalized_types:
        collectors.append(_search_tasks(db, normalized_query, limit))

    results = [result for collection in collectors for result in collection]
    query_lower = normalized_query.lower()
    results.sort(key=lambda result: _score_result(query_lower, result))

    return SearchResponse(query=normalized_query, total=len(results), results=results)


@semantic_router.post("/query", response_model=SmartSearchResponse)
def semantic_search(payload: SmartSearchRequest) -> SmartSearchResponse:
    """Run semantic search against indexed UniBond study posts."""
    return smart_search_service.search(query=payload.query, top_k=payload.top_k)


@semantic_router.post("/rebuild-index", response_model=SearchIndexRebuildResponse)
def rebuild_search_index() -> SearchIndexRebuildResponse:
    """Rebuild the local FAISS index from the sample post dataset."""
    return smart_search_service.rebuild_index()


@semantic_router.get("/posts", response_model=list[IndexedPostResponse])
def get_indexed_posts() -> list[IndexedPostResponse]:
    """Return the posts currently used by the MVP smart search index."""
    return smart_search_service.get_indexed_posts()
