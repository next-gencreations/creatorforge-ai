from pydantic import BaseModel, Field


class CaptionGenerateRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=8000)
    language: str = Field(default="English", max_length=50)
    emoji: bool = False


class CaptionCue(BaseModel):
    index: int
    start: float
    end: float
    text: str


class CaptionGenerateResponse(BaseModel):
    cues: list[CaptionCue]
    srt: str
