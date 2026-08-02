from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.script import ScriptGenerateRequest, ScriptGenerateResponse
from app.services.llm import generate_script_content

router = APIRouter(prefix="/scripts", tags=["scripts"])


@router.post("/generate", response_model=ScriptGenerateResponse)
def generate(
    data: ScriptGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        content = generate_script_content(data.mode, data.prompt, data.template)
    except Exception as exc:
        raise_for_llm_error(exc)

    return ScriptGenerateResponse(content=content)
