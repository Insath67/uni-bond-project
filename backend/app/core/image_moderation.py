"""Configuration constants for the Phase 2 image moderation module."""

from __future__ import annotations

from pathlib import Path


ALLOWED_IMAGE_MIME_TYPES: set[str] = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_IMAGE_EXTENSIONS: set[str] = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_IMAGE_PIXELS = 25_000_000

STUDY_RELATED_KEYWORDS: set[str] = {
    "book",
    "bookcase",
    "comic book",
    "computer",
    "desktop computer",
    "keyboard",
    "laptop",
    "monitor",
    "mouse",
    "notebook",
    "screen",
    "tablet",
    "typewriter keyboard",
    "web site",
    "projector",
    "school bus",
    "library",
}

REVIEW_KEYWORDS: set[str] = {
    "ballpoint",
    "binder",
    "cellular telephone",
    "mobile phone",
    "packet",
    "pencil box",
    "purse",
    "switch",
    "television",
    "wallet",
}

UNRELATED_KEYWORDS: set[str] = {
    "alcohol",
    "beer",
    "bikini",
    "cocktail",
    "comic",
    "dog",
    "guitar",
    "lipstick",
    "mountain",
    "party",
    "restaurant",
    "stage",
    "swimming",
    "wine",
}

HIGH_CONFIDENCE_ALLOW_EXPLANATION = (
    "This image appears likely related to study or educational activity."
)
LOW_CONFIDENCE_ALLOW_EXPLANATION = (
    "This image may be study-related, but the model confidence is modest, so review is safer."
)
REVIEW_EXPLANATION = (
    "This image is not clearly educational from the model prediction alone, so it should be reviewed."
)
REJECT_EXPLANATION = (
    "The uploaded file is not a supported or valid image, so it was rejected before moderation."
)


def is_allowed_image_extension(filename: str) -> bool:
    """Return True when the uploaded filename has a supported image extension."""
    return Path(filename).suffix.lower() in ALLOWED_IMAGE_EXTENSIONS
