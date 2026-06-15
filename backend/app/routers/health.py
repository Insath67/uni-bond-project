from fastapi import APIRouter

from app.schemas.ai_image import AIModelComponentHealth, AIServiceHealthResponse
from app.services.image_moderation_service import (
    get_image_inference_backend,
    get_image_model_error,
    get_image_model_name,
    is_image_model_loaded,
)
from app.services.text_moderation_service import (
    get_inference_backend,
    get_model_error,
    get_text_model_name,
    is_model_loaded,
)

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=AIServiceHealthResponse)
def health_check() -> AIServiceHealthResponse:
    """Basic health check for API and AI readiness."""
    return AIServiceHealthResponse(
        status="ok",
        service="UniBond API",
        text_ai=AIModelComponentHealth(
            model_name=get_text_model_name(),
            model_loaded=is_model_loaded(),
            inference_backend=get_inference_backend(),
            detail=get_model_error(),
        ),
        image_ai=AIModelComponentHealth(
            model_name=get_image_model_name(),
            model_loaded=is_image_model_loaded(),
            inference_backend=get_image_inference_backend(),
            detail=get_image_model_error(),
        ),
    )
