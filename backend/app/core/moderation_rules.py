from __future__ import annotations

from app.schemas.moderation import (
    ImageModerationResult,
    ModerationDecision,
    TextModerationResult,
)


def combine_moderation_results(
    text_result: TextModerationResult | None,
    image_result: ImageModerationResult | None,
) -> ModerationDecision:
    """Combine text and image moderation into one platform decision."""
    if text_result is None and image_result is None:
        return ModerationDecision(
            status="rejected",
            is_allowed=False,
            reasons=["A post must include meaningful text, an image, or both."],
            explanation="The submission was rejected because no usable content was provided.",
        )

    component_results = [result for result in (text_result, image_result) if result is not None]

    reasons = _build_reasons(text_result=text_result, image_result=image_result)

    if any(result.status == "rejected" for result in component_results):
        return ModerationDecision(
            status="rejected",
            is_allowed=False,
            reasons=reasons,
            explanation=_build_final_explanation(
                final_status="rejected",
                text_result=text_result,
                image_result=image_result,
            ),
        )

    if all(result.status == "allowed" for result in component_results):
        return ModerationDecision(
            status="allowed",
            is_allowed=True,
            reasons=reasons,
            explanation=_build_final_explanation(
                final_status="allowed",
                text_result=text_result,
                image_result=image_result,
            ),
        )

    return ModerationDecision(
        status="review",
        is_allowed=False,
        reasons=reasons,
        explanation=_build_final_explanation(
            final_status="review",
            text_result=text_result,
            image_result=image_result,
        ),
    )


def _build_reasons(
    text_result: TextModerationResult | None,
    image_result: ImageModerationResult | None,
) -> list[str]:
    reasons: list[str] = []

    if text_result is not None:
        if text_result.status == "allowed":
            reasons.append("The text looks appropriate for an academic discussion.")
        elif text_result.status == "review":
            reasons.append("The text is somewhat uncertain, so it should be reviewed.")
        else:
            reasons.append("The text looks non-academic, promotional, unsafe, or unrelated to study content.")

    if image_result is not None:
        if image_result.status == "allowed":
            reasons.append("The image looks suitable for a study-focused post.")
        elif image_result.status == "review":
            reasons.append("The image does not look clearly related to study content.")
        else:
            reasons.append("The image violates the moderation rules.")

    return reasons


def _build_final_explanation(
    final_status: str,
    text_result: TextModerationResult | None,
    image_result: ImageModerationResult | None,
) -> str:
    if final_status == "allowed":
        if text_result is not None and image_result is not None:
            return "Both the text and image look appropriate for UniBond, so the post can be allowed."
        if text_result is not None:
            return "The text looks suitable for UniBond's academic community."
        return "The image looks suitable for a study-focused post."

    if final_status == "rejected":
        if text_result is not None and text_result.status == "rejected":
            return "The post was rejected because the text strongly appears off-topic, unsafe, or promotional."
        if image_result is not None and image_result.status == "rejected":
            return "The post was rejected because the image does not meet the moderation requirements."
        return "The post was rejected because it does not provide acceptable content for moderation."

    if text_result is not None and image_result is not None:
        return "The submission includes some suitable content, but one part is still uncertain, so manual review is the safest choice."
    if text_result is not None:
        return "The text is not clearly suitable for automatic approval, so review is recommended."
    return "The image is not clearly suitable for automatic approval, so review is recommended."
