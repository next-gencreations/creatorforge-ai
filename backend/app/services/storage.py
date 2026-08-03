import os
import uuid

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.storage_file import StorageFile


class StorageQuotaExceeded(RuntimeError):
    pass


def user_dir(user_id: int) -> str:
    path = os.path.join(settings.storage_root, str(user_id))
    os.makedirs(path, exist_ok=True)
    return path


def used_bytes(user_id: int, db: Session) -> int:
    files = db.query(StorageFile).filter(StorageFile.owner_id == user_id).all()
    return sum(f.size_bytes for f in files)


def save_file(
    user_id: int,
    db: Session,
    *,
    filename: str,
    content_type: str,
    folder: str,
    raw_bytes: bytes,
) -> StorageFile:
    if used_bytes(user_id, db) + len(raw_bytes) > settings.storage_quota_bytes:
        raise StorageQuotaExceeded("This upload would exceed your storage quota")

    disk_name = f"{uuid.uuid4().hex}_{filename}"
    disk_path = os.path.join(user_dir(user_id), disk_name)
    with open(disk_path, "wb") as fh:
        fh.write(raw_bytes)

    record = StorageFile(
        owner_id=user_id,
        folder=folder.strip() or "Uncategorized",
        filename=filename,
        content_type=content_type,
        size_bytes=len(raw_bytes),
        storage_path=disk_path,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
