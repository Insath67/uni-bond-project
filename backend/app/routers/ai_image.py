from __future__ import annotations

from fastapi import APIRouter, File, UploadFile

from app.schemas.ai_image import ImageModerationErrorResponse, ImageModerationResponse
from app.services.image_moderation_service import moderate_image_upload

router = APIRouter(prefix="/api/v1/ai", tags=["AI Image Moderation"])


@router.post(
    "/image-moderate",
    response_model=ImageModerationResponse,
    responses={
        400: {"model": ImageModerationErrorResponse},
        413: {"model": ImageModerationErrorResponse},
        415: {"model": ImageModerationErrorResponse},
        422: {"model": ImageModerationErrorResponse},
        500: {"model": ImageModerationErrorResponse},
        503: {"model": ImageModerationErrorResponse},
    },
)
async def moderate_uploaded_image(
    file: UploadFile = File(..., description="Study-related image to moderate."),
) -> ImageModerationResponse:
    """Moderate an uploaded image for UniBond's study-focused feed."""
    return await moderate_image_upload(file)
