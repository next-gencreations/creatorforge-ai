from pydantic import BaseModel, Field, field_validator

PLATFORM_CHOICES = ["YouTube", "TikTok", "Instagram", "Facebook", "X", "LinkedIn", "Pinterest", "Twitch"]


class PublishingOptimizeRequest(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
    platforms: list[str] = Field(min_length=1, max_length=len(PLATFORM_CHOICES))

    @field_validator("platforms")
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


class PlatformVersion(BaseModel):
    platform: str
    text: str
    notes: str


class PublishingOptimizeResponse(BaseModel):
    versions: list[PlatformVersion]
