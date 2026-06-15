"""Helpers for validating and decoding uploaded images safely."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageFile, UnidentifiedImageError

from app.core.config import settings
from app.core.image_moderation import (
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_IMAGE_PIXELS,
    REJECT_EXPLANATION,
    is_allowed_image_extension,
)

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
ImageFile.LOAD_TRUNCATED_IMAGES = False


async def read_and_validate_image_upload(file: UploadFile) -> tuple[str, str, bytes]:
    """Validate upload metadata and return the raw bytes for inference."""
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is required.",
        )

    filename = (file.filename or "").strip()
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image must include a filename.",
        )

    if not is_allowed_image_extension(filename):
        allowed_extensions = ", ".join(
            sorted(extension.lstrip(".") for extension in ALLOWED_IMAGE_EXTENSIONS)
        )
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported image filename extension for '{Path(filename).name}'. "
                f"Allowed extensions are {allowed_extensions}."
            ),
        )

    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Unsupported image type. Allowed types are JPEG, JPG, PNG, and WEBP."
            ),
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image is empty.",
        )

    if len(file_bytes) > settings.ai_image_max_file_size_bytes:
        max_mb = settings.ai_image_max_file_size_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image is too large. Maximum allowed size is {max_mb:.0f} MB.",
        )

    return filename, content_type, file_bytes


def load_image_from_bytes(file_bytes: bytes) -> Image.Image:
    """Decode the uploaded image using Pillow and normalize it to RGB."""
    try:
        with Image.open(BytesIO(file_bytes)) as decoded_image:
            decoded_image.verify()
        with Image.open(BytesIO(file_bytes)) as decoded_image:
            decoded_image.load()

            if decoded_image.width <= 0 or decoded_image.height <= 0:
                raise ValueError("Image width and height must be greater than zero.")

            return decoded_image.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{REJECT_EXPLANATION} Pillow could not safely decode the uploaded file.",
        ) from exc
