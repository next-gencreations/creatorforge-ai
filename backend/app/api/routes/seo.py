from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.seo import SeoGenerateRequest, SeoGenerateResponse
from app.services.llm import generate_seo_metadata

router = APIRouter(prefix="/seo", tags=["seo"])


@router.post("/generate", response_model=SeoGenerateResponse)
def generate(
    data: SeoGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_seo_metadata(data.topic, data.existing_title)
    except Exception as exc:
        raise_for_llm_error(exc)

    return SeoGenerateResponse(**result)
