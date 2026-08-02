from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

IDEA_SOURCES = ["Note", "Voice Memo", "Reddit", "Trending Search", "Comment", "News", "RSS Feed", "Other"]


class IdeaCreate(BaseModel):
    source: str = "Note"
    content: str = Field(min_length=1, max_length=2000)


class IdeaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: str
    content: str
    created_at: datetime
