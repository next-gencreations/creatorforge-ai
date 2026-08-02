from pydantic import BaseModel, Field


class GrowthCoachRequest(BaseModel):
    context: str = Field(min_length=1, max_length=4000)


class GrowthCoachResponse(BaseModel):
    diagnosis: str
    content_ideas: list[str]
    priorities: list[str]
    upload_timing_tip: str
