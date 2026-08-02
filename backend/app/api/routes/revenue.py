from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.errors import raise_for_llm_error
from app.db.session import get_db
from app.models.income import IncomeEntry
from app.models.sponsor import Sponsor
from app.models.user import User
from app.schemas.income import RevenueReportResponse, RevenueSummary
from app.services.llm import generate_revenue_report

router = APIRouter(prefix="/revenue", tags=["revenue"])


def _compute_summary(user: User, db: Session) -> RevenueSummary:
    totals: dict[str, float] = defaultdict(float)

    for entry in db.query(IncomeEntry).filter(IncomeEntry.owner_id == user.id).all():
        totals[entry.source] += entry.amount

    paid_sponsorships = (
        db.query(Sponsor).filter(Sponsor.owner_id == user.id, Sponsor.status == "Paid").all()
    )
    sponsor_total = sum(s.amount for s in paid_sponsorships)
    if sponsor_total > 0:
        totals["Sponsorships"] += sponsor_total

    streams = sorted(
        ({"source": source, "amount": amount} for source, amount in totals.items() if amount > 0),
        key=lambda s: s["amount"],
        reverse=True,
    )
    return RevenueSummary(streams=streams, total=sum(totals.values()))


@router.get("/summary", response_model=RevenueSummary)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _compute_summary(current_user, db)


@router.post("/report", response_model=RevenueReportResponse)
def create_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    summary = _compute_summary(current_user, db)
    if not summary.streams:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Log at least one income entry first")

    try:
        report = generate_revenue_report([s.model_dump() for s in summary.streams], summary.total)
    except Exception as exc:
        raise_for_llm_error(exc)

    return RevenueReportResponse(report=report)
