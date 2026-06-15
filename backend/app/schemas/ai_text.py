from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.config import settings


class TextModerationRequest(BaseModel):
    """Incoming payload for text moderation."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "text": "Can someone explain database normalization with examples?"
            }
        }
    )

    text: str = Field(
        ...,
        min_length=settings.ai_text_min_text_length,
        max_length=settings.ai_text_max_text_length,
        description="Post text that should be classified by the AI module.",
        examples=["Can someone explain database normalization with examples?"],
    )

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Text cannot be empty or only whitespace.")
        return cleaned_value


class TextModerationResponse(BaseModel):
    """Successful moderation result returned to clients."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "input_text": "Can someone explain database normalization with examples?",
                "predicted_label": "study_related",
                "confidence": 0.94,
                "is_allowed": True,
                "explanation": "This text appears educational and related to learning or academic discussion.",
            }
        }
    )

    input_text: str
    predicted_label: Literal["study_related", "non_study_related"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: str = Field(..., examples=["94.21%"])
    is_allowed: bool
    explanation: str


class ErrorResponse(BaseModel):
    """Simple reusable error shape for documented API responses."""

    detail: str
