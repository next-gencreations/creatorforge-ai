from pydantic import BaseModel, Field

ALLOWED_MEDIA_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


class ThumbnailAnalyzeRequest(BaseModel):
    image_data: str = Field(min_length=1, description="Base64-encoded image data, no data: URL prefix")
    media_type: str
    video_topic: str | None = Field(default=None, max_length=300)


class ThumbnailAnalyzeResponse(BaseModel):
    ctr_score: float
    score_rationale: str
    feedback: list[str]
    title_suggestions: list[str]
