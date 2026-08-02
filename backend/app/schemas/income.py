from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

INCOME_SOURCES = ["YouTube Ad Revenue", "Merchandise", "Affiliate Sales", "Patreon", "Donations", "Other"]


class IncomeCreate(BaseModel):
    source: str = "Other"
    amount: float = Field(gt=0)
    entry_date: date
    note: str | None = Field(default=None, max_length=500)


class IncomeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: str
    amount: float
    entry_date: date
    note: str | None
    created_at: datetime


class RevenueStream(BaseModel):
    source: str
    amount: float


class RevenueSummary(BaseModel):
    streams: list[RevenueStream]
    total: float


class RevenueReportResponse(BaseModel):
    report: str
