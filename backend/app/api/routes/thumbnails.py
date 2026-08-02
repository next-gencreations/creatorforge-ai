import base64
import binascii

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.thumbnail import ALLOWED_MEDIA_TYPES, ThumbnailAnalyzeRequest, ThumbnailAnalyzeResponse
from app.services.llm import analyze_thumbnail

router = APIRouter(prefix="/thumbnails", tags=["thumbnails"])

MAX_IMAGE_BYTES = 5 * 1024 * 1024


@router.post("/analyze", response_model=ThumbnailAnalyzeResponse)
def analyze(
    data: ThumbnailAnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    if data.media_type not in ALLOWED_MEDIA_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Unsupported image type. Use one of: {', '.join(sorted(ALLOWED_MEDIA_TYPES))}",
        )

    try:
        raw_size = len(base64.b64decode(data.image_data, validate=True))
    except binascii.Error as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "image_data is not valid base64") from exc

    if raw_size > MAX_IMAGE_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Image exceeds the 5MB limit")

    try:
        result = analyze_thumbnail(data.image_data, data.media_type, data.video_topic)
    except Exception as exc:
        raise_for_llm_error(exc)

    return ThumbnailAnalyzeResponse(**result)
