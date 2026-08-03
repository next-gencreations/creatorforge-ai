from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.editor import EditPlanRequest, EditPlanResponse
from app.services.llm import generate_edit_plan

router = APIRouter(prefix="/editor", tags=["editor"])


@router.post("/plan", response_model=EditPlanResponse)
def create_edit_plan(
    data: EditPlanRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        plan = generate_edit_plan(data.footage_notes, data.platform_targets)
    except Exception as exc:
        raise_for_llm_error(exc)

    return EditPlanResponse(**plan)
