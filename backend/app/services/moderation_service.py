from __future__ import annotations

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.core.moderation_rules import combine_moderation_results
from app.schemas.ai_image import ImagePredictionCandidate
from app.schemas.ai_text import TextModerationResponse
from app.schemas.moderation import (
    ImageModerationResult,
    ModerationCheckResponse,
    ModerationPredictionCandidate,
    TextModerationResult,
)
from app.services.image_moderation_service import moderate_image_upload
from app.services.text_moderation_service import NON_STUDY_LABEL_KEY, STUDY_LABEL_KEY, moderate_text


async def moderate_content(
    text: str | None,
    image: UploadFile | None,
) -> ModerationCheckResponse:
    """Central moderation gateway for text-only, image-only, and mixed submissions."""
    cleaned_text = _clean_optional_text(text)
    normalized_image = _normalize_optional_image(image)
    has_text = cleaned_text is not None
    has_image = normalized_image is not None

    if not has_text and not has_image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide post text, an image, or both.",
        )

    text_result = _build_text_result(moderate_text(cleaned_text)) if has_text else None
    image_result = await _build_image_result(normalized_image) if has_image else None
    final_decision = combine_moderation_results(text_result=text_result, image_result=image_result)

    return ModerationCheckResponse(
        has_text=has_text,
        has_image=has_image,
        text_result=text_result,
        image_result=image_result,
        final_status=final_decision.status,
        is_allowed=final_decision.is_allowed,
        reasons=final_decision.reasons,
        explanation=final_decision.explanation,
        final_decision=final_decision,
    )


def _clean_optional_text(text: str | None) -> str | None:
    if text is None:
        return None

    cleaned_text = text.strip()
    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Text cannot be empty or only whitespace when provided.",
        )

    if len(cleaned_text) < settings.ai_text_min_text_length:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Text must be at least {settings.ai_text_min_text_length} characters long.",
        )

    if len(cleaned_text) > settings.ai_text_max_text_length:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Text must not exceed {settings.ai_text_max_text_length} characters.",
        )

    return cleaned_text


def _normalize_optional_image(image: UploadFile | None) -> UploadFile | None:
    if image is None:
        return None

    filename = (image.filename or "").strip()
    if not filename:
        return None

    return image


def _build_text_result(result: TextModerationResponse) -> TextModerationResult:
    status_value = _derive_text_status(result)
    return TextModerationResult(
        predicted_label=result.predicted_label,
        confidence=result.confidence,
        confidence_percentage=result.confidence_percentage,
        confidence_level=_get_confidence_level(result.confidence),
        status=status_value,
        is_allowed=status_value == "allowed",
        explanation=_build_text_explanation(result=result, status_value=status_value),
    )


async def _build_image_result(image: UploadFile) -> ImageModerationResult:
    result = await moderate_image_upload(image)
    return ImageModerationResult(
        filename=result.filename,
        content_type=result.content_type,
        predicted_label=result.predicted_label,
        detected_subject=result.detected_subject,
        confidence=result.confidence,
        confidence_percentage=result.confidence_percentage,
        confidence_level=result.confidence_level,
        academic_relevance=result.academic_relevance,
        status=result.moderation_status,
        is_allowed=result.moderation_status == "allowed",
        explanation=result.explanation,
        moderation_reason=result.moderation_reason,
        upload_guidance=result.upload_guidance,
        top_predictions=[
            _serialize_prediction(candidate) for candidate in result.top_predictions
        ],
    )


def _derive_text_status(result: TextModerationResponse) -> str:
    if result.predicted_label == STUDY_LABEL_KEY:
        if result.confidence >= 0.7:
            return "allowed"
        return "review"

    if result.predicted_label == NON_STUDY_LABEL_KEY:
        if result.confidence >= 0.8:
            return "rejected"
        return "review"

    return "review"


def _serialize_prediction(candidate: ImagePredictionCandidate) -> ModerationPredictionCandidate:
    return ModerationPredictionCandidate(
        label=candidate.label,
        confidence=candidate.confidence,
        confidence_percentage=_format_confidence_percentage(candidate.confidence),
    )


def _get_confidence_level(value: float) -> str:
    if value >= 0.75:
        return "high"
    if value >= 0.45:
        return "medium"
    return "low"


def _format_confidence_percentage(value: float) -> str:
    return f"{float(value) * 100:.2f}%"


def _build_text_explanation(
    result: TextModerationResponse,
    status_value: str,
) -> str:
    if result.predicted_label == STUDY_LABEL_KEY and status_value == "allowed":
        return (
            "The text looks clearly academic and fits UniBond's study-focused community."
        )

    if result.predicted_label == STUDY_LABEL_KEY:
        return (
            "The text seems academic, but the confidence is not strong enough to auto-approve it."
        )

    if status_value == "rejected":
        return (
            "The text looks strongly non-academic or promotional, so it should not be published."
        )

    return (
        "The text may be off-topic or promotional, but the confidence is not high enough for an automatic rejection."
    )

