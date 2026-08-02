from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.growth_coach import GrowthCoachRequest, GrowthCoachResponse
from app.services.llm import get_growth_coach_advice

router = APIRouter(prefix="/growth-coach", tags=["growth-coach"])


@router.post("/advise", response_model=GrowthCoachResponse)
def advise(
    data: GrowthCoachRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        advice = get_growth_coach_advice(data.context)
    except Exception as exc:
        raise_for_llm_error(exc)

    return GrowthCoachResponse(**advice)
