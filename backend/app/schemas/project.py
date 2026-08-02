from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    title: str
    platform_targets: list[str] = []


class ProjectUpdate(BaseModel):
    title: str | None = None
    status: ProjectStatus | None = None
    platform_targets: list[str] | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: ProjectStatus
    platform_targets: list[str]
    duration_seconds: int | None
    created_at: datetime
    updated_at: datetime
