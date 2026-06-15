from __future__ import annotations

from typing import Iterable

import numpy as np
from fastapi import HTTPException, status

from app.core.config import settings

try:
    from sentence_transformers import SentenceTransformer
except ImportError:  # pragma: no cover - handled at runtime
    SentenceTransformer = None


class EmbeddingService:
    """Loads the embedding model once and converts text into normalized vectors."""

    def __init__(self, model_name: str) -> None:
        self.model_name = model_name
        self._model: SentenceTransformer | None = None

    def _load_model(self) -> SentenceTransformer:
        if SentenceTransformer is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "sentence-transformers is not installed. "
                    "Install the Phase 4 search dependencies first."
                ),
            )

        if self._model is None:
            try:
                self._model = SentenceTransformer(self.model_name)
            except Exception as exc:  # pragma: no cover - depends on local environment
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Failed to load embedding model '{self.model_name}': {exc}",
                ) from exc

        return self._model

    def encode_texts(self, texts: Iterable[str]) -> np.ndarray:
        text_list = [text.strip() for text in texts if text and text.strip()]
        if not text_list:
            return np.empty((0, 0), dtype=np.float32)

        model = self._load_model()
        vectors = model.encode(
            text_list,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
        return np.asarray(vectors, dtype=np.float32)

    def encode_query(self, query: str) -> np.ndarray:
        query_vector = self.encode_texts([query])
        if query_vector.size == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Query cannot be empty after cleaning.",
            )
        return query_vector

    def get_model_name(self) -> str:
        return self.model_name


embedding_service = EmbeddingService(settings.smart_search_model_name)
