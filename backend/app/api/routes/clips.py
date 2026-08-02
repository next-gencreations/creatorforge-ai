from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.clip import ClipGenerateRequest, ClipGenerateResponse
from app.services.llm import find_viral_clips

router = APIRouter(prefix="/clips", tags=["clips"])


@router.post("/generate", response_model=ClipGenerateResponse)
def generate(
    data: ClipGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        clips = find_viral_clips(data.transcript)
    except Exception as exc:
        raise_for_llm_error(exc)

    return ClipGenerateResponse(clips=clips)
