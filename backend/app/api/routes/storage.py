import base64
import binascii
import os
import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.storage_file import StorageFile
from app.models.user import User
from app.schemas.storage import MAX_UPLOAD_BYTES, FileOut, FileUploadRequest, FolderSummary, StorageSummary

router = APIRouter(prefix="/storage", tags=["storage"])


def _user_dir(user_id: int) -> str:
    path = os.path.join(settings.storage_root, str(user_id))
    os.makedirs(path, exist_ok=True)
    return path


def _used_bytes(user_id: int, db: Session) -> int:
    files = db.query(StorageFile).filter(StorageFile.owner_id == user_id).all()
    return sum(f.size_bytes for f in files)


@router.get("/summary", response_model=StorageSummary)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    files = db.query(StorageFile).filter(StorageFile.owner_id == current_user.id).all()

    totals: dict[str, list] = defaultdict(lambda: [0, 0])
    for f in files:
        totals[f.folder][0] += 1
        totals[f.folder][1] += f.size_bytes

    folders = sorted(
        (FolderSummary(folder=name, item_count=count, total_bytes=size) for name, (count, size) in totals.items()),
        key=lambda fs: fs.total_bytes,
        reverse=True,
    )
    return StorageSummary(folders=folders, used_bytes=sum(f.size_bytes for f in files), quota_bytes=settings.storage_quota_bytes)


@router.get("/files", response_model=list[FileOut])
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(StorageFile)
        .filter(StorageFile.owner_id == current_user.id)
        .order_by(StorageFile.created_at.desc())
        .all()
    )


@router.post("/files", response_model=FileOut, status_code=status.HTTP_201_CREATED)
def upload_file(
    data: FileUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        raw_bytes = base64.b64decode(data.file_data, validate=True)
    except binascii.Error as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "file_data is not valid base64") from exc

    if len(raw_bytes) == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File is empty")
    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit")

    used = _used_bytes(current_user.id, db)
    if used + len(raw_bytes) > settings.storage_quota_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This upload would exceed your storage quota")

    disk_name = f"{uuid.uuid4().hex}_{data.filename}"
    disk_path = os.path.join(_user_dir(current_user.id), disk_name)
    with open(disk_path, "wb") as fh:
        fh.write(raw_bytes)

    record = StorageFile(
        owner_id=current_user.id,
        folder=data.folder.strip() or "Uncategorized",
        filename=data.filename,
        content_type=data.content_type,
        size_bytes=len(raw_bytes),
        storage_path=disk_path,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/files/{file_id}/download")
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(StorageFile).filter(StorageFile.id == file_id, StorageFile.owner_id == current_user.id).first()
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")

    if not os.path.isfile(record.storage_path):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File is no longer available on disk")

    with open(record.storage_path, "rb") as fh:
        content = fh.read()

    return Response(
        content=content,
        media_type=record.content_type,
        headers={"Content-Disposition": f'attachment; filename="{record.filename}"'},
    )


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(StorageFile).filter(StorageFile.id == file_id, StorageFile.owner_id == current_user.id).first()
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")

    if os.path.isfile(record.storage_path):
        os.remove(record.storage_path)

    db.delete(record)
    db.commit()
