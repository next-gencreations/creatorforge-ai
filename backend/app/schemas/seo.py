from pydantic import BaseModel, Field


class SeoGenerateRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=6000)
    existing_title: str | None = Field(default=None, max_length=200)


class SeoGenerateResponse(BaseModel):
    title: str
    description: str
    tags: list[str]
    hashtags: list[str]
    chapters: list[str]
    keyword_focus: list[str]
    assessment: str
