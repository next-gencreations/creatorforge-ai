from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

MAX_UPLOAD_BYTES = 25 * 1024 * 1024


class FileUploadRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=100)
    folder: str = Field(default="Uncategorized", max_length=100)
    file_data: str


class FileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    folder: str
    content_type: str
    size_bytes: int
    created_at: datetime


class FolderSummary(BaseModel):
    folder: str
    item_count: int
    total_bytes: int


class StorageSummary(BaseModel):
    folders: list[FolderSummary]
    used_bytes: int
    quota_bytes: int
