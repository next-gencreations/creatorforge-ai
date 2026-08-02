from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.models.user import User
from app.schemas.comment import CommentModerateRequest, CommentModerateResponse
from app.services.llm import moderate_comments

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("/moderate", response_model=CommentModerateResponse)
def moderate(
    data: CommentModerateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        results = moderate_comments(data.comments)
    except Exception as exc:
        raise_for_llm_error(exc)

    return CommentModerateResponse(results=results)
