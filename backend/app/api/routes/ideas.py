from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.idea import Idea
from app.models.user import User
from app.schemas.idea import IdeaCreate, IdeaOut

router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.get("", response_model=list[IdeaOut])
def list_ideas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Idea)
        .filter(Idea.owner_id == current_user.id)
        .order_by(Idea.created_at.desc())
        .all()
    )


@router.post("", response_model=IdeaOut, status_code=status.HTTP_201_CREATED)
def create_idea(
    data: IdeaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    idea = Idea(source=data.source, content=data.content, owner_id=current_user.id)
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.owner_id == current_user.id).first()
    if idea is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Idea not found")
    db.delete(idea)
    db.commit()
