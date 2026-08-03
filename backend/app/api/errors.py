import anthropic
from fastapi import HTTPException, status

from app.services.audio import AudioConfigError, AudioProviderError
from app.services.llm import LLMConfigError, LLMRefusalError


def raise_for_llm_error(exc: Exception) -> None:
    if isinstance(exc, LLMConfigError):
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    if isinstance(exc, LLMRefusalError):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    if isinstance(exc, anthropic.AuthenticationError):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Invalid Anthropic API key") from exc
    if isinstance(exc, anthropic.RateLimitError):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Rate limited by Anthropic API") from exc
    if isinstance(exc, anthropic.APIConnectionError):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not reach the Anthropic API") from exc
    if isinstance(exc, anthropic.APIStatusError):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Anthropic API error: {exc.message}") from exc
    raise exc


def raise_for_audio_error(exc: Exception) -> None:
    if isinstance(exc, AudioConfigError):
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    if isinstance(exc, AudioProviderError):
        raise HTTPException(exc.status_code, str(exc)) from exc
    raise exc
