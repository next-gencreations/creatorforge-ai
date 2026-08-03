from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.errors import raise_for_audio_error
from app.db.session import get_db
from app.models.user import User
from app.schemas.audio import VoiceoverRequest
from app.schemas.storage import FileOut
from app.services.audio import generate_voiceover
from app.services.storage import StorageQuotaExceeded, save_file

router = APIRouter(prefix="/audio", tags=["audio"])


@router.post("/voiceover", response_model=FileOut, status_code=status.HTTP_201_CREATED)
def create_voiceover(
    data: VoiceoverRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        audio_bytes = generate_voiceover(data.script, data.voice)
    except Exception as exc:
        raise_for_audio_error(exc)

    filename = f"{data.voice.lower()}-voiceover-{data.script[:20].strip() or 'untitled'}.mp3".replace(" ", "-")

    try:
        return save_file(
            current_user.id,
            db,
            filename=filename,
            content_type="audio/mpeg",
            folder="Voiceovers",
            raw_bytes=audio_bytes,
        )
    except StorageQuotaExceeded as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
