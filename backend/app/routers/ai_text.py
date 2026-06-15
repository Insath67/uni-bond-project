from fastapi import APIRouter

from app.schemas.ai_text import ErrorResponse, TextModerationRequest, TextModerationResponse
from app.services.text_moderation_service import moderate_text

router = APIRouter(prefix="/api/v1/ai", tags=["AI Text Moderation"])


@router.post(
    "/text-moderate",
    response_model=TextModerationResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
def moderate_post_text(payload: TextModerationRequest) -> TextModerationResponse:
    """Moderate incoming post text for Phase 1 text classification."""
    return moderate_text(payload.text)
