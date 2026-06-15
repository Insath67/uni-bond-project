from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ImagePredictionCandidate(BaseModel):
    """Single model candidate kept for debugging and UI transparency."""

    label: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class ImageModerationResponse(BaseModel):
    """Successful moderation response for an uploaded image."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "filename": "notes-photo.jpg",
                "content_type": "image/jpeg",
                "predicted_label": "laptop",
                "detected_subject": "Laptop",
                "confidence": 0.87,
                "confidence_percentage": "87.00%",
                "confidence_level": "high",
                "academic_relevance": "study_related",
                "moderation_status": "allowed",
                "is_allowed": True,
                "explanation": "This image looks relevant to study activity because the model mainly detected a laptop or computer-like setup.",
                "moderation_reason": "The detected content matches common study-related objects.",
                "upload_guidance": [
                    "The image can be used because it clearly shows academic or coursework-related content."
                ],
                "top_predictions": [
                    {"label": "laptop", "confidence": 0.87},
                    {"label": "desktop computer", "confidence": 0.08},
                ],
            }
        }
    )

    filename: str
    content_type: str
    predicted_label: str
    detected_subject: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: str
    confidence_level: Literal["low", "medium", "high"]
    academic_relevance: Literal[
        "study_related", "possibly_study_related", "not_study_related", "uncertain"
    ]
    moderation_status: Literal["allowed", "review", "rejected"]
    is_allowed: bool
    explanation: str
    moderation_reason: str
    upload_guidance: list[str]
    top_predictions: list[ImagePredictionCandidate]


class ImageModerationErrorResponse(BaseModel):
    """Reusable error schema for image moderation failures."""

    detail: str


class AIModelComponentHealth(BaseModel):
    """Readiness payload for a single AI module."""

    model_name: str
    model_loaded: bool
    inference_backend: str
    detail: str | None = None


class AIServiceHealthResponse(BaseModel):
    """Combined health response for UniBond AI services."""

    status: Literal["ok"]
    service: str
    text_ai: AIModelComponentHealth
    image_ai: AIModelComponentHealth
