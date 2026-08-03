from pydantic import BaseModel, Field, field_validator

VOICE_CHOICES = {
    "Rachel": "21m00Tcm4TlvDq8ikWAM",
    "Adam": "pNInz6obpgDQGcFmaJgB",
    "Bella": "EXAVITQu4vr4xnSDxMaL",
    "Antoni": "ErXwobaYiN019PkySvjV",
}


class VoiceoverRequest(BaseModel):
    script: str = Field(min_length=1, max_length=5000)
    voice: str = Field(default="Rachel")

    @field_validator("voice")
    @classmethod
    def validate_voice(cls, value: str) -> str:
        if value not in VOICE_CHOICES:
            raise ValueError(f"Unknown voice '{value}'. Choose one of: {', '.join(VOICE_CHOICES)}")
        return value
