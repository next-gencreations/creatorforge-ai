from pydantic import BaseModel, Field

from app.services.llm import ScriptMode


class ScriptGenerateRequest(BaseModel):
    mode: ScriptMode = "script"
    prompt: str = Field(min_length=1, max_length=4000)
    template: str | None = None


class ScriptGenerateResponse(BaseModel):
    content: str
