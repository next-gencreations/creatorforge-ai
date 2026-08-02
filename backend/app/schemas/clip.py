from pydantic import BaseModel, Field


class ClipGenerateRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=8000)


class ClipCandidate(BaseModel):
    quote: str
    timestamp_hint: str | None
    reason: str
    suggested_title: str
    platform_caption: str
    score: float


class ClipGenerateResponse(BaseModel):
    clips: list[ClipCandidate]
