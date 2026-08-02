from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.db.session import get_db
from app.models.sponsor import Sponsor
from app.models.user import User
from app.schemas.sponsor import SponsorCreate, SponsorOut, SponsorReportResponse, SponsorUpdate
from app.services.llm import generate_sponsor_report

router = APIRouter(prefix="/sponsors", tags=["sponsors"])


def _get_owned_sponsor(sponsor_id: int, user: User, db: Session) -> Sponsor:
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id, Sponsor.owner_id == user.id).first()
    if sponsor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sponsor not found")
    return sponsor


@router.get("", response_model=list[SponsorOut])
def list_sponsors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Sponsor)
        .filter(Sponsor.owner_id == current_user.id)
        .order_by(Sponsor.created_at.desc())
        .all()
    )


@router.post("", response_model=SponsorOut, status_code=status.HTTP_201_CREATED)
def create_sponsor(
    data: SponsorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsor = Sponsor(owner_id=current_user.id, **data.model_dump())
    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)
    return sponsor


@router.patch("/{sponsor_id}", response_model=SponsorOut)
def update_sponsor(
    sponsor_id: int,
    data: SponsorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsor = _get_owned_sponsor(sponsor_id, current_user, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sponsor, field, value)
    db.commit()
    db.refresh(sponsor)
    return sponsor


@router.delete("/{sponsor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sponsor(
    sponsor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsor = _get_owned_sponsor(sponsor_id, current_user, db)
    db.delete(sponsor)
    db.commit()


@router.post("/report", response_model=SponsorReportResponse)
def create_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsor_records = (
        db.query(Sponsor)
        .filter(Sponsor.owner_id == current_user.id)
        .order_by(Sponsor.created_at.desc())
        .all()
    )
    if not sponsor_records:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Add at least one sponsor deal first")

    total_value = sum(s.amount for s in sponsor_records)
    payload = [
        {
            "name": s.name,
            "deliverable": s.deliverable,
            "deadline": s.deadline.isoformat() if s.deadline else None,
            "amount": s.amount,
            "status": s.status,
        }
        for s in sponsor_records
    ]

    try:
        report = generate_sponsor_report(payload, total_value)
    except Exception as exc:
        raise_for_llm_error(exc)

    return SponsorReportResponse(report=report, total_value=total_value)
