import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, File as DBFile, Evidence, Entity, Contradiction, Relation
from ..schemas import WorldCreate, WorldOut, WorldStats

router = APIRouter(prefix="/worlds", tags=["Worlds"])

def _get_own_world(db: Session, user: User, world_id: uuid.UUID) -> World:
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if world is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")
    return world

@router.post("", response_model=WorldOut, status_code=status.HTTP_201_CREATED)
def create_world(data: WorldCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    world = World(user_id=user.id, name=data.name, domain=data.domain, purpose=data.purpose)
    db.add(world)
    db.commit()
    db.refresh(world)
    return world

@router.get("", response_model=list[WorldOut])
def list_worlds(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(World).where(World.user_id == user.id).order_by(World.created_at.desc())).all()

@router.get("/{world_id}", response_model=WorldOut)
def get_world(world_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_own_world(db, user, world_id)

@router.delete("/{world_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_world(world_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    world = _get_own_world(db, user, world_id)
    db.delete(world)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- NEW: Stats Route ---
@router.get("/{world_id}/stats", response_model=WorldStats)
def get_world_stats(world_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    world = _get_own_world(db, user, world_id)
    
    files = db.scalar(select(func.count(DBFile.id)).where(DBFile.world_id == world.id, DBFile.status == "ACTIVE"))
    evidence = db.scalar(select(func.count(Evidence.id)).where(Evidence.world_id == world.id, Evidence.status == "ACTIVE"))
    entities = db.scalar(select(func.count(Entity.id)).where(Entity.world_id == world.id, Entity.status == "ACTIVE"))
    contradictions = db.scalar(select(func.count(Contradiction.id)).where(Contradiction.world_id == world.id, Contradiction.status == "ACTIVE"))
    
    return WorldStats(
        files_count=files or 0,
        evidence_count=evidence or 0,
        entities_count=entities or 0,
        contradictions_count=contradictions or 0
    )

# --- NEW: Export Route ---
@router.get("/{world_id}/export")
def export_world(world_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    world = _get_own_world(db, user, world_id)
    
    files = db.scalars(select(DBFile).where(DBFile.world_id == world.id)).all()
    evidences = db.scalars(select(Evidence).where(Evidence.world_id == world.id)).all()
    entities = db.scalars(select(Entity).where(Entity.world_id == world.id)).all()
    relations = db.scalars(select(Relation).where(Relation.world_id == world.id)).all()
    
    export_data = {
        "world": {"name": world.name, "domain": world.domain, "purpose": world.purpose},
        "files": [{"filename": f.filename, "status": f.status} for f in files],
        "evidence_count": len(evidences),
        "entities": [{"name": e.name, "type": e.entity_type} for e in entities],
        "relations": [{"source": r.source_entity_id, "target": r.target_entity_id, "type": r.relation_type} for r in relations],
    }
    
    return Response(
        content=json.dumps(export_data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={world.name.replace(' ', '_')}_export.json"}
    )