from pydantic import BaseModel, Field, field_validator


class CommentModerateRequest(BaseModel):
    comments: list[str] = Field(min_length=1, max_length=20)

    @field_validator("comments")
    @classmethod
    def validate_comments(cls, value: list[str]) -> list[str]:
        for comment in value:
            if not comment.strip():
                raise ValueError("Comments cannot be empty")
            if len(comment) > 1000:
                raise ValueError("Each comment must be 1000 characters or fewer")
        return value


class CommentResult(BaseModel):
    sentiment: str
    is_spam: bool
    suggested_reply: str | None


class CommentModerateResponse(BaseModel):
    results: list[CommentResult]
