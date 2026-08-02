from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.income import IncomeEntry
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeOut

router = APIRouter(prefix="/income", tags=["income"])


@router.get("", response_model=list[IncomeOut])
def list_income(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(IncomeEntry)
        .filter(IncomeEntry.owner_id == current_user.id)
        .order_by(IncomeEntry.entry_date.desc())
        .all()
    )


@router.post("", response_model=IncomeOut, status_code=status.HTTP_201_CREATED)
def create_income(
    data: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = IncomeEntry(owner_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(IncomeEntry).filter(IncomeEntry.id == income_id, IncomeEntry.owner_id == current_user.id).first()
    if entry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Income entry not found")
    db.delete(entry)
    db.commit()
