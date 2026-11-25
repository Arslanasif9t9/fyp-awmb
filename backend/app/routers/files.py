import os
import uuid
import hashlib
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, File as DBFile, Evidence # <-- Evidence import kiya
from ..schemas import FileOut
from ..config import get_settings
from ..services.parser import extract_text, chunk_text # <-- Parser import kiya

router = APIRouter(prefix="/worlds", tags=["Files"])
settings = get_settings()

def _get_own_world(db: Session, user: User, world_id: uuid.UUID) -> World:
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if world is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")
    return world

def get_file_type(filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    if ext in ["pdf"]: return "pdf"
    if ext in ["jpg", "jpeg", "png", "webp"]: return "image"
    if ext in ["xls", "xlsx", "csv"]: return "excel"
    return "text"

@router.post("/{world_id}/files", response_model=FileOut, status_code=status.HTTP_201_CREATED)
async def upload_file(
    world_id: uuid.UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = _get_own_world(db, user, world_id)
    
    max_mb = getattr(settings, "max_upload_mb", 25)
    upload_dir = getattr(settings, "upload_dir", "./uploads")
    
    max_size = max_mb * 1024 * 1024
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > max_size:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"File too large. Max {max_mb}MB")

    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, safe_filename)
    
    sha256_hash = hashlib.sha256()
    with open(file_path, "wb") as buffer:
        while chunk := file.file.read(8192):
            sha256_hash.update(chunk)
            buffer.write(chunk)

    # DB Record for File
    db_file = DBFile(
        world_id=world.id,
        filename=file.filename,
        file_type=get_file_type(file.filename),
        storage_path=file_path,
        sha256=sha256_hash.hexdigest(),
        status="ACTIVE",
        uploaded_by=user.id
    )
    db.add(db_file)
    db.flush() # Flush taake db_file.id generate ho jaye (commit se pehle)

    # Extract Text & Chunk
    extracted_text = extract_text(file_path, db_file.file_type)
    if extracted_text:
        chunks = chunk_text(extracted_text)
        for i, chunk in enumerate(chunks):
            evidence = Evidence(
                world_id=world.id,
                file_id=db_file.id,
                claim_text=chunk,
                source_type="file",
                reliability="HIGH", # Documents are high reliability
                chunk_ref=f"chunk_{i}",
                status="ACTIVE"
            )
            db.add(evidence)

    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.get("/{world_id}/files", response_model=list[FileOut])
def list_files(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = _get_own_world(db, user, world_id)
    return db.scalars(
        select(DBFile).where(DBFile.world_id == world.id).order_by(DBFile.uploaded_at.desc())
    ).all()