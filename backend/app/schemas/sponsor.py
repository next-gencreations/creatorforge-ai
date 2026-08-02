from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

SPONSOR_STATUSES = ["Prospecting", "Contract sent", "In progress", "Delivered", "Paid"]


class SponsorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    deliverable: str = Field(min_length=1, max_length=500)
    deadline: date | None = None
    amount: float = Field(default=0.0, ge=0)
    status: str = "Prospecting"
    notes: str | None = Field(default=None, max_length=2000)


class SponsorUpdate(BaseModel):
    name: str | None = None
    deliverable: str | None = None
    deadline: date | None = None
    amount: float | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = None


class SponsorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    deliverable: str
    deadline: date | None
    amount: float
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime


class SponsorReportResponse(BaseModel):
    report: str
    total_value: float
