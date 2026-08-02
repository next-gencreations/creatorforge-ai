from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.publishing import PublishingOptimizeRequest, PublishingOptimizeResponse
from app.services.llm import optimize_for_platforms

router = APIRouter(prefix="/publishing", tags=["publishing"])


@router.post("/optimize", response_model=PublishingOptimizeResponse)
def optimize(
    data: PublishingOptimizeRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        versions = optimize_for_platforms(data.content, data.platforms)
    except Exception as exc:
        raise_for_llm_error(exc)

    return PublishingOptimizeResponse(versions=versions)
