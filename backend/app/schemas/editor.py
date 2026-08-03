from pydantic import BaseModel, Field, field_validator

from app.schemas.publishing import PLATFORM_CHOICES


class EditPlanRequest(BaseModel):
    footage_notes: str = Field(min_length=1, max_length=8000)
    platform_targets: list[str] = Field(default_factory=list, max_length=len(PLATFORM_CHOICES))

    @field_validator("platform_targets")
    @classmethod
    def validate_platforms(cls, value: list[str]) -> list[str]:
        invalid = sorted(set(value) - set(PLATFORM_CHOICES))
        if invalid:
            raise ValueError(f"Unsupported platform(s): {', '.join(invalid)}")
        seen: set[str] = set()
        deduped = []
        for platform in value:
            if platform not in seen:
                seen.add(platform)
                deduped.append(platform)
        return deduped


class CutSuggestion(BaseModel):
    timestamp_hint: str | None
    reason: str


class SceneStep(BaseModel):
    label: str
    description: str


class PlatformEditNote(BaseModel):
    platform: str
    note: str


class EditPlanResponse(BaseModel):
    cut_list: list[CutSuggestion]
    scene_plan: list[SceneStep]
    platform_notes: list[PlatformEditNote]
    overall_notes: str
