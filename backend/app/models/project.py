import enum
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, func, Enum, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    processing = "processing"
    ready = "ready"
    published = "published"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status"), default=ProjectStatus.draft, nullable=False
    )
    platform_targets: Mapped[list[str]] = mapped_column(JSON, default=list)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="projects")
