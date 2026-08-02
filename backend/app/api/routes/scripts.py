import anthropic
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.script import ScriptGenerateRequest, ScriptGenerateResponse
from app.services.llm import LLMConfigError, LLMRefusalError, generate_script_content

router = APIRouter(prefix="/scripts", tags=["scripts"])


@router.post("/generate", response_model=ScriptGenerateResponse)
def generate(
    data: ScriptGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        content = generate_script_content(data.mode, data.prompt, data.template)
    except LLMConfigError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except LLMRefusalError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    except anthropic.AuthenticationError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Invalid Anthropic API key") from exc
    except anthropic.RateLimitError as exc:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Rate limited by Anthropic API") from exc
    except anthropic.APIConnectionError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not reach the Anthropic API") from exc
    except anthropic.APIStatusError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Anthropic API error: {exc.message}") from exc

    return ScriptGenerateResponse(content=content)
