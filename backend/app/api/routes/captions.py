from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.caption import CaptionGenerateRequest, CaptionGenerateResponse
from app.services.captions import build_srt
from app.services.llm import generate_caption_cues

router = APIRouter(prefix="/captions", tags=["captions"])


@router.post("/generate", response_model=CaptionGenerateResponse)
def generate(
    data: CaptionGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        cue_texts = generate_caption_cues(data.transcript, data.language, data.emoji)
    except Exception as exc:
        raise_for_llm_error(exc)

    srt, items = build_srt(cue_texts)
    return CaptionGenerateResponse(cues=items, srt=srt)
