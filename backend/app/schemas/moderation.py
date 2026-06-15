from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ModerationStatus = Literal["allowed", "review", "rejected"]
ConfidenceLevel = Literal["low", "medium", "high"]


class TextModerationResult(BaseModel):
    """Normalized text moderation result used by the combined gateway."""

    predicted_label: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: str
    confidence_level: ConfidenceLevel
    status: ModerationStatus
    is_allowed: bool
    explanation: str


class ModerationPredictionCandidate(BaseModel):
    """Simple prediction candidate shown in image moderation responses."""

    label: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: str


class ImageModerationResult(BaseModel):
    """Normalized image moderation result used by the combined gateway."""

    filename: str
    content_type: str
    predicted_label: str
    detected_subject: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: str
    confidence_level: ConfidenceLevel
    academic_relevance: Literal[
        "study_related", "possibly_study_related", "not_study_related", "uncertain"
    ]
    status: ModerationStatus
    is_allowed: bool
    explanation: str
    moderation_reason: str
    upload_guidance: list[str] = Field(default_factory=list)
    top_predictions: list[ModerationPredictionCandidate] = Field(default_factory=list)


class ModerationDecision(BaseModel):
    """Final combined decision returned to the client."""

    status: ModerationStatus
    is_allowed: bool
    reasons: list[str]
    explanation: str


class ModerationCheckResponse(BaseModel):
    """Response returned by the Phase 3 moderation gateway."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "has_text": True,
                "has_image": True,
                "text_result": {
                    "predicted_label": "study_related",
                    "confidence": 0.91,
                    "confidence_percentage": "91.00%",
                    "confidence_level": "high",
                    "status": "allowed",
                    "is_allowed": True,
                    "explanation": "The text looks clearly academic and fits UniBond's study-focused community.",
                },
                "image_result": {
                    "filename": "party_photo.jpg",
                    "content_type": "image/jpeg",
                    "predicted_label": "party scene",
                    "detected_subject": "Party Scene",
                    "confidence": 0.85,
                    "confidence_percentage": "85.00%",
                    "confidence_level": "high",
                    "academic_relevance": "not_study_related",
                    "status": "review",
                    "is_allowed": False,
                    "explanation": "The image does not look clearly academic, so it should be reviewed before publishing.",
                    "moderation_reason": "The image appears to focus on a social scene instead of study material.",
                    "upload_guidance": [
                        "Upload a clearer academic image such as notes, a laptop, a whiteboard, a slide, or lab work."
                    ],
                    "top_predictions": [
                        {
                            "label": "party scene",
                            "confidence": 0.85,
                            "confidence_percentage": "85.00%"
                        },
                        {
                            "label": "restaurant",
                            "confidence": 0.07,
                            "confidence_percentage": "7.00%"
                        },
                    ],
                },
                "final_status": "review",
                "is_allowed": False,
                "reasons": [
                    "The text looks appropriate for an academic discussion.",
                    "The image does not look clearly related to study content.",
                ],
                "explanation": "The submission includes some suitable content, but one part is still uncertain, so manual review is the safest choice.",
                "final_decision": {
                    "status": "review",
                    "is_allowed": False,
                    "reasons": [
                        "The text looks appropriate for an academic discussion.",
                        "The image does not look clearly related to study content.",
                    ],
                    "explanation": "The submission includes some suitable content, but one part is still uncertain, so manual review is the safest choice.",
                },
            }
        }
    )

    has_text: bool
    has_image: bool
    text_result: TextModerationResult | None = None
    image_result: ImageModerationResult | None = None
    final_status: ModerationStatus
    is_allowed: bool
    reasons: list[str]
    explanation: str
    final_decision: ModerationDecision


class ModerationErrorResponse(BaseModel):
    """Reusable error schema for the moderation gateway."""

    detail: str
