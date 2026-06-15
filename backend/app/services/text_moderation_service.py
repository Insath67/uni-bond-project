from __future__ import annotations

import os
import re
from typing import Any

from app.core.config import settings
from app.schemas.ai_text import TextModerationResponse

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

try:
    from transformers import pipeline
except ImportError:  # pragma: no cover - handled at runtime in environments without transformers
    pipeline = None


STUDY_LABEL_KEY = "study_related"
NON_STUDY_LABEL_KEY = "non_study_related"

_classifier = None
_classifier_load_attempted = False
_classifier_load_error: str | None = None

STUDY_KEYWORDS = {
    "study",
    "assignment",
    "lecture",
    "exam",
    "mid",
    "quiz",
    "tutorial",
    "course",
    "class",
    "classroom",
    "academic",
    "education",
    "research",
    "project",
    "database",
    "algorithm",
    "calculus",
    "physics",
    "chemistry",
    "biology",
    "math",
    "java",
    "python",
    "programming",
    "software",
    "networking",
    "notes",
    "presentation",
    "report",
    "lab",
    "semester",
    "gpa",
}

NON_STUDY_KEYWORDS = {
    "party",
    "hangout",
    "movie",
    "meme",
    "crypto",
    "sale",
    "selling",
    "discount",
    "giveaway",
    "follow",
    "subscribe",
    "dm",
    "concert",
    "music",
    "dating",
    "funny",
    "game",
    "gaming",
    "earn money",
    "buy now",
    "promo",
    "promotion",
    "channel",
    "night out",
}


def _get_text_classifier():
    """Load the zero-shot classification pipeline lazily on first use."""
    global _classifier, _classifier_load_attempted, _classifier_load_error

    if _classifier is not None:
        return _classifier

    if _classifier_load_attempted:
        return None

    _classifier_load_attempted = True

    if pipeline is None:
        _classifier_load_error = "Transformers is not installed."
        return None

    try:
        _classifier = pipeline(
            task="zero-shot-classification",
            model=settings.ai_text_model_name,
            token=settings.hf_token,
        )
    except Exception as exc:  # pragma: no cover - depends on local model/runtime setup
        _classifier_load_error = str(exc)
        return None

    return _classifier


def is_model_loaded() -> bool:
    return _classifier is not None


def get_inference_backend() -> str:
    return "transformers" if is_model_loaded() else "fallback_rules"


def get_model_error() -> str | None:
    return _classifier_load_error


def get_text_model_name() -> str:
    return settings.ai_text_model_name


def moderate_text(text: str) -> TextModerationResponse:
    """Classify text into study-related or non-study-related content."""
    cleaned_text = _normalize_text(text)
    classifier = _get_text_classifier()
    if classifier is None:
        return _moderate_text_with_fallback(cleaned_text)

    label_options = [
        settings.ai_text_study_label,
        settings.ai_text_non_study_label,
    ]

    try:
        result: dict[str, Any] = classifier(
            sequences=cleaned_text,
            candidate_labels=label_options,
            hypothesis_template="This post is {}.",
            multi_label=False,
        )
    except Exception:  # pragma: no cover - depends on model/runtime setup
        return _moderate_text_with_fallback(cleaned_text)

    top_label = result["labels"][0]
    top_score = float(result["scores"][0])
    predicted_label = (
        STUDY_LABEL_KEY
        if top_label == settings.ai_text_study_label
        else NON_STUDY_LABEL_KEY
    )

    is_allowed = predicted_label == STUDY_LABEL_KEY
    explanation = _build_explanation(predicted_label, top_score)

    return TextModerationResponse(
        input_text=cleaned_text,
        predicted_label=predicted_label,
        confidence=_format_confidence(top_score),
        confidence_percentage=_format_confidence_percentage(top_score),
        is_allowed=is_allowed,
        explanation=explanation,
    )


def _moderate_text_with_fallback(text: str) -> TextModerationResponse:
    normalized_text = text.lower()
    study_hits = sum(1 for keyword in STUDY_KEYWORDS if keyword in normalized_text)
    non_study_hits = sum(1 for keyword in NON_STUDY_KEYWORDS if keyword in normalized_text)
    looks_like_question = "?" in text

    if study_hits > non_study_hits:
        predicted_label = STUDY_LABEL_KEY
        confidence = min(0.6 + study_hits * 0.08, 0.89)
    elif non_study_hits > study_hits:
        predicted_label = NON_STUDY_LABEL_KEY
        confidence = min(0.6 + non_study_hits * 0.08, 0.89)
    elif looks_like_question:
        predicted_label = STUDY_LABEL_KEY
        confidence = 0.58
    else:
        predicted_label = NON_STUDY_LABEL_KEY
        confidence = 0.55

    return TextModerationResponse(
        input_text=text,
        predicted_label=predicted_label,
        confidence=_format_confidence(confidence),
        confidence_percentage=_format_confidence_percentage(confidence),
        is_allowed=predicted_label == STUDY_LABEL_KEY,
        explanation=_build_explanation(predicted_label, confidence, using_fallback=True),
    )


def _build_explanation(
    predicted_label: str,
    confidence: float,
    using_fallback: bool = False,
) -> str:
    confidence_hint = (
        " Confidence is moderate, so a manual review would be a good idea."
        if confidence < 0.65
        else ""
    )
    backend_hint = (
        " This result was generated by the local fallback rules because the HuggingFace model is not ready yet."
        if using_fallback
        else ""
    )

    if predicted_label == STUDY_LABEL_KEY:
        return (
            "This post looks relevant to studying, coursework, or academic discussion."
            + backend_hint
            + confidence_hint
        )

    return (
        "This post looks unrelated to study-focused discussion, so it should be flagged for review."
        + backend_hint
        + confidence_hint
    )


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _format_confidence(value: float) -> float:
    return round(float(value), 2)


def _format_confidence_percentage(value: float) -> str:
    return f"{float(value) * 100:.2f}%"
