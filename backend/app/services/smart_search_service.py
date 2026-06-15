from __future__ import annotations

import json
from pathlib import Path

from fastapi import HTTPException, status
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.search import (
    IndexedPostResponse,
    SearchIndexRebuildResponse,
    SearchablePost,
    SmartSearchResponse,
    SmartSearchResultItem,
)
from app.services.embedding_service import embedding_service
from app.services.faiss_index_service import FaissIndexService
from app.services.smart_search_repository import SmartSearchRepository


class SmartSearchService:
    """Coordinates post loading, embeddings, FAISS indexing, and response formatting."""

    def __init__(self) -> None:
        self.repository = SmartSearchRepository(settings.smart_search_posts_path)
        self.embedding_service = embedding_service
        self.index_service = FaissIndexService()
        base_dir = Path(__file__).resolve().parents[2]
        raw_index_dir = Path(settings.smart_search_index_dir)
        self.index_dir = raw_index_dir if raw_index_dir.is_absolute() else base_dir / raw_index_dir
        self.index_path = self.index_dir / "posts.index"
        self.metadata_path = self.index_dir / "posts_metadata.json"
        self._indexed_posts: list[IndexedPostResponse] = []

    def rebuild_index(self) -> SearchIndexRebuildResponse:
        posts = self.repository.load_posts()
        if not posts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No posts are available to index.",
            )

        indexed_posts = [
            IndexedPostResponse(
                **post.model_dump(),
                searchable_text=self.prepare_searchable_text(post),
            )
            for post in posts
        ]

        embeddings = self.embedding_service.encode_texts(
            post.searchable_text for post in indexed_posts
        )
        indexed_count, embedding_dimension = self.index_service.build_index(embeddings)

        saved_index_path = self.index_service.save_index(str(self.index_path))
        saved_metadata_path = self._save_metadata(indexed_posts)
        self._indexed_posts = indexed_posts

        return SearchIndexRebuildResponse(
            status="success",
            message="Smart search index rebuilt successfully.",
            indexed_posts=indexed_count,
            embedding_dimension=embedding_dimension,
            index_path=saved_index_path,
            metadata_path=saved_metadata_path,
        )

    def search(self, query: str, top_k: int) -> SmartSearchResponse:
        cleaned_query = query.strip()
        if len(cleaned_query) < settings.smart_search_min_query_length:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Query must be at least {settings.smart_search_min_query_length} "
                    "characters long."
                ),
            )

        self.ensure_index_ready()
        limited_top_k = min(
            max(top_k, 1),
            settings.smart_search_max_top_k,
            len(self._indexed_posts),
        )
        query_embedding = self.embedding_service.encode_query(cleaned_query)
        distances, indices = self.index_service.search(query_embedding, limited_top_k)

        matched_results: list[tuple[float, IndexedPostResponse]] = []
        ranked_pairs = zip(distances[0], indices[0], strict=False)
        for score, post_index in ranked_pairs:
            if post_index < 0 or post_index >= len(self._indexed_posts):
                continue

            similarity_score = self._format_similarity_score(float(score))
            if similarity_score < settings.smart_search_min_similarity:
                continue

            matched_results.append((similarity_score, self._indexed_posts[post_index]))

        matched_results.sort(
            key=lambda item: (item[0], item[1].created_at.timestamp()),
            reverse=True,
        )

        results: list[SmartSearchResultItem] = []
        for rank, (similarity_score, post) in enumerate(matched_results, start=1):
            results.append(
                SmartSearchResultItem(
                    rank=rank,
                    post_id=post.id,
                    title=post.title,
                    content_preview=self._build_content_preview(post.content),
                    author_name=post.author_name,
                    similarity_score=similarity_score,
                    created_at=post.created_at,
                )
            )

        return SmartSearchResponse(
            query=cleaned_query,
            total_results=len(results),
            results=results,
        )

    def get_indexed_posts(self) -> list[IndexedPostResponse]:
        self.ensure_index_ready()
        return self._indexed_posts

    def add_post(self, post: SearchablePost) -> None:
        self.ensure_index_ready()
        searchable_text = self.prepare_searchable_text(post)
        embeddings = self.embedding_service.encode_texts([searchable_text])
        self.index_service.add_embeddings(embeddings)

        indexed_post = IndexedPostResponse(
            **post.model_dump(),
            searchable_text=searchable_text,
        )
        self._indexed_posts.append(indexed_post)
        self.repository.append_runtime_post(post)
        self._save_metadata(self._indexed_posts)
        self.index_service.save_index(str(self.index_path))

    def prepare_searchable_text(self, post: SearchablePost) -> str:
        title = post.title.strip()
        content = post.content.strip()
        return f"Title: {title}\nContent: {content}"

    def ensure_index_ready(self) -> None:
        if self.index_service.has_index() and self._indexed_posts:
            return

        metadata_loaded = self._load_metadata()
        index_loaded = self.index_service.load_index(str(self.index_path))
        if metadata_loaded and index_loaded and self.index_service.get_size() == len(self._indexed_posts):
            return

        self.rebuild_index()

    def _save_metadata(self, indexed_posts: list[IndexedPostResponse]) -> str:
        self.index_dir.mkdir(parents=True, exist_ok=True)
        serialized_posts = [post.model_dump(mode="json") for post in indexed_posts]
        self.metadata_path.write_text(
            json.dumps(serialized_posts, indent=2),
            encoding="utf-8",
        )
        return str(self.metadata_path)

    def _load_metadata(self) -> bool:
        if not self.metadata_path.exists():
            return False

        try:
            raw_content = self.metadata_path.read_text(encoding="utf-8")
            raw_items = json.loads(raw_content)
            self._indexed_posts = [
                IndexedPostResponse.model_validate(item) for item in raw_items
            ]
        except (OSError, json.JSONDecodeError, ValidationError):
            self._indexed_posts = []
            return False

        return bool(self._indexed_posts)

    def _build_content_preview(self, content: str) -> str:
        preview_length = settings.smart_search_content_preview_length
        cleaned_content = " ".join(content.split())
        if len(cleaned_content) <= preview_length:
            return cleaned_content
        return f"{cleaned_content[:preview_length].rstrip()}..."

    def _format_similarity_score(self, score: float) -> float:
        normalized_score = max(0.0, min(score, 1.0))
        return round(normalized_score, 4)


smart_search_service = SmartSearchService()
