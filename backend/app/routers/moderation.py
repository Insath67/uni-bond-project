from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.moderation import ModerationCheckResponse, ModerationErrorResponse
from app.services.moderation_service import moderate_content

router = APIRouter(prefix="/api/v1/moderation", tags=["Moderation"])


@router.post(
    "/check",
    response_model=ModerationCheckResponse,
    responses={
        400: {"model": ModerationErrorResponse},
        413: {"model": ModerationErrorResponse},
        415: {"model": ModerationErrorResponse},
        422: {"model": ModerationErrorResponse},
        500: {"model": ModerationErrorResponse},
        503: {"model": ModerationErrorResponse},
    },
)
async def check_moderation(
    text: Annotated[
        str | None,
        Form(
            description="Optional post text to moderate.",
        ),
    ] = None,
    image: Annotated[
        UploadFile | None,
        File(
            description="Optional image file to moderate.",
        ),
    ] = None,
) -> ModerationCheckResponse:
    """Run central moderation for text-only, image-only, or mixed post content."""
    return await moderate_content(text=text, image=image)
