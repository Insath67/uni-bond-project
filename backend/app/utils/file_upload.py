"""
file_upload.py
--------------
Utility functions for handling media file uploads in UniBond.

Responsibilities:
  - Validate MIME type (only allow specific image/video formats)
  - Enforce file size limit
  - Generate a safe, unique filename using UUID
  - Save the file to the correct uploads sub-directory
  - Return a URL path that FastAPI's StaticFiles can serve
"""

import os
import uuid
from fastapi import HTTPException, UploadFile, status

# ── Allowed MIME types ────────────────────────────────────────────────────────
# Maps content-type → file extension
ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/jpg":  "jpg",
    "image/png":  "png",
    "image/webp": "webp",
}

ALLOWED_VIDEO_TYPES: dict[str, str] = {
    "video/mp4":  "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",  # MOV (commonly from iPhone)
}

# ── Size limit: 20 MB ─────────────────────────────────────────────────────────
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

# ── Upload directory (relative to where uvicorn is launched) ──────────────────
UPLOAD_BASE_DIR = "uploads"


def _ensure_dirs() -> None:
    """Create uploads/images and uploads/videos directories if they don't exist."""
    os.makedirs(os.path.join(UPLOAD_BASE_DIR, "images"), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_BASE_DIR, "videos"), exist_ok=True)


async def save_upload_file(file: UploadFile) -> tuple[str, str]:
    """
    Validate, save, and return URL metadata for an uploaded file.

    Parameters
    ----------
    file : UploadFile
        The uploaded file from FastAPI's form data.

    Returns
    -------
    tuple[str, str]
        (media_url, media_type) where:
        - media_url  is a URL path like "/uploads/images/<uuid>.jpg"
        - media_type is "image" or "video"

    Raises
    ------
    HTTPException 415  if the MIME type is not allowed
    HTTPException 413  if the file exceeds the size limit
    """
    _ensure_dirs()

    # Some clients/frameworks may send content-type with codec parameters.
    # Normalize to the base MIME type so our whitelist works reliably.
    content_type = (file.content_type or "").split(";")[0].strip().lower()

    # ── Determine media type ──────────────────────────────────────────────────
    if content_type in ALLOWED_IMAGE_TYPES:
        media_type = "image"
        extension = ALLOWED_IMAGE_TYPES[content_type]
        sub_dir = "images"
    elif content_type in ALLOWED_VIDEO_TYPES:
        media_type = "video"
        extension = ALLOWED_VIDEO_TYPES[content_type]
        sub_dir = "videos"
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type: '{content_type}'. "
                "Allowed: jpg, jpeg, png, webp (images) | mp4, webm, mov (videos)."
            ),
        )

    # ── Read file content ─────────────────────────────────────────────────────
    file_bytes = await file.read()

    # ── Enforce size limit ────────────────────────────────────────────────────
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is 20 MB.",
        )

    # ── Generate unique filename ──────────────────────────────────────────────
    unique_name = f"{uuid.uuid4().hex}.{extension}"
    save_path = os.path.join(UPLOAD_BASE_DIR, sub_dir, unique_name)

    # ── Write to disk ─────────────────────────────────────────────────────────
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    # ── Build the URL path that StaticFiles will serve ────────────────────────
    media_url = f"/uploads/{sub_dir}/{unique_name}"

    return media_url, media_type
