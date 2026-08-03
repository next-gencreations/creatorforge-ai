import httpx

from app.core.config import settings
from app.schemas.audio import VOICE_CHOICES

ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"


class AudioConfigError(RuntimeError):
    pass


class AudioProviderError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


def generate_voiceover(script: str, voice: str) -> bytes:
    if not settings.elevenlabs_api_key:
        raise AudioConfigError("ELEVENLABS_API_KEY is not configured on the server")

    voice_id = VOICE_CHOICES[voice]

    try:
        response = httpx.post(
            f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": settings.elevenlabs_api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": script,
                "model_id": settings.elevenlabs_model,
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
            timeout=60.0,
        )
    except httpx.RequestError as exc:
        raise AudioProviderError("Could not reach the ElevenLabs API", status_code=502) from exc

    if response.status_code == 401:
        raise AudioProviderError("Invalid ElevenLabs API key", status_code=502)
    if response.status_code == 429:
        raise AudioProviderError("Rate limited by the ElevenLabs API", status_code=429)
    if response.status_code >= 400:
        raise AudioProviderError(f"ElevenLabs API error: {response.text[:300]}", status_code=502)

    return response.content
