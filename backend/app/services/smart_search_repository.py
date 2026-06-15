from __future__ import annotations

import json
from pathlib import Path

from fastapi import HTTPException, status
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.search import SearchablePost


class SmartSearchRepository:
    """Loads MVP search posts from a local JSON file."""

    def __init__(self, posts_file_path: str) -> None:
        base_dir = Path(__file__).resolve().parents[2]
        raw_path = Path(posts_file_path)
        self.posts_file_path = raw_path if raw_path.is_absolute() else base_dir / raw_path
        runtime_path = Path(settings.smart_search_runtime_posts_path)
        self.runtime_posts_file_path = base_dir / runtime_path

    def load_posts(self) -> list[SearchablePost]:
        sample_posts = self._load_posts_from_path(self.posts_file_path, is_required=True)
        runtime_posts = self._load_posts_from_path(self.runtime_posts_file_path, is_required=False)
        return [*sample_posts, *runtime_posts]

    def append_runtime_post(self, post: SearchablePost) -> None:
        existing_posts = self._load_posts_from_path(self.runtime_posts_file_path, is_required=False)
        updated_posts = [saved_post for saved_post in existing_posts if saved_post.id != post.id]
        updated_posts.append(post)
        self.runtime_posts_file_path.parent.mkdir(parents=True, exist_ok=True)
        self.runtime_posts_file_path.write_text(
            json.dumps([item.model_dump(mode="json") for item in updated_posts], indent=2),
            encoding="utf-8",
        )

    def _load_posts_from_path(
        self,
        path: Path,
        *,
        is_required: bool,
    ) -> list[SearchablePost]:
        if not path.exists():
            if is_required:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Sample search dataset was not found at '{path}'.",
                )
            return []

        try:
            raw_posts = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Search dataset is invalid JSON at '{path}': {exc}",
            ) from exc

        if not isinstance(raw_posts, list):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Search dataset at '{path}' must be a JSON array of posts.",
            )

        try:
            return [SearchablePost.model_validate(item) for item in raw_posts]
        except ValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Search dataset at '{path}' contains invalid post data: {exc}",
            ) from exc
