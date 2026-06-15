from __future__ import annotations

from pathlib import Path

import numpy as np
from fastapi import HTTPException, status

try:
    import faiss
except ImportError:  # pragma: no cover - handled at runtime
    faiss = None


class FaissIndexService:
    """Creates, searches, saves, and loads a FAISS index for semantic search."""

    def __init__(self) -> None:
        self._index: faiss.Index | None = None
        self._dimension: int | None = None

    def _require_faiss(self) -> None:
        if faiss is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="faiss-cpu is not installed. Install the Phase 4 search dependencies first.",
            )

    def build_index(self, embeddings: np.ndarray) -> tuple[int, int]:
        self._require_faiss()

        if embeddings.ndim != 2 or embeddings.shape[0] == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot build a FAISS index without embeddings.",
            )

        dimension = int(embeddings.shape[1])
        self._index = faiss.IndexFlatIP(dimension)
        self._index.add(np.asarray(embeddings, dtype=np.float32))
        self._dimension = dimension
        return int(embeddings.shape[0]), dimension

    def search(self, query_embedding: np.ndarray, top_k: int) -> tuple[np.ndarray, np.ndarray]:
        self._require_faiss()

        if self._index is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search index is not ready. Rebuild the index first.",
            )

        if query_embedding.ndim != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query embedding must be a 2D array.",
            )

        distances, indices = self._index.search(
            np.asarray(query_embedding, dtype=np.float32),
            top_k,
        )
        return distances, indices

    def add_embeddings(self, embeddings: np.ndarray) -> int:
        self._require_faiss()

        if self._index is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search index is not ready. Rebuild the index first.",
            )

        if embeddings.ndim != 2 or embeddings.shape[0] == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add empty embeddings to the FAISS index.",
            )

        if self._dimension is None or int(embeddings.shape[1]) != self._dimension:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Embedding dimension does not match the current FAISS index.",
            )

        self._index.add(np.asarray(embeddings, dtype=np.float32))
        return int(embeddings.shape[0])

    def get_size(self) -> int:
        if self._index is None:
            return 0
        return int(self._index.ntotal)

    def save_index(self, index_path: str) -> str:
        self._require_faiss()

        if self._index is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No FAISS index is available to save.",
            )

        path = Path(index_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self._index, str(path))
        return str(path)

    def load_index(self, index_path: str) -> bool:
        self._require_faiss()
        path = Path(index_path)
        if not path.exists():
            return False

        self._index = faiss.read_index(str(path))
        self._dimension = int(self._index.d)
        return True

    def has_index(self) -> bool:
        return self._index is not None

    def get_dimension(self) -> int:
        return self._dimension or 0
