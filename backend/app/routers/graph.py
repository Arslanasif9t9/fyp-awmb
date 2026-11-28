import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, Evidence, Entity, Relation
from ..services.ai_service import extract_entities_and_relations
from ..schemas import GraphDataOut, EntityOut, RelationOut

router = APIRouter(prefix="/worlds", tags=["Graph"])

@router.post("/{world_id}/extract-graph")
async def extract_graph(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if not world:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")

    # Sirf ACTIVE evidence uthao
    evidences = db.scalars(select(Evidence).where(Evidence.world_id == world.id, Evidence.status == "ACTIVE")).all()
    
    if not evidences:
        return {"message": "No active evidence found to extract from."}

    # Purana graph clear karo (fresh extraction ke liye)
    db.query(Relation).filter(Relation.world_id == world.id).delete()
    db.query(Entity).filter(Entity.world_id == world.id).delete()
    db.commit()

    entity_map = {} # Name -> Entity ID

    for ev in evidences:
        data = await extract_entities_and_relations(ev.claim_text)
        
        # 1. Save Entities
        for ent in data.get("entities", []):
            name = ent.get("name", "").strip()
            ent_type = ent.get("type", "Concept").strip()
            if not name: continue
            
            if name.lower() not in entity_map:
                new_entity = Entity(world_id=world.id, name=name, entity_type=ent_type)
                db.add(new_entity)
                db.flush()
                entity_map[name.lower()] = new_entity.id

        # 2. Save Relations
        for rel in data.get("relations", []):
            src = rel.get("source", "").strip().lower()
            tgt = rel.get("target", "").strip().lower()
            rel_type = rel.get("relation", "related_to").strip()
            
            if src in entity_map and tgt in entity_map:
                new_rel = Relation(
                    world_id=world.id,
                    source_entity_id=entity_map[src],
                    target_entity_id=entity_map[tgt],
                    relation_type=rel_type
                )
                db.add(new_rel)
    
    db.commit()
    return {"message": f"Extracted {len(entity_map)} unique entities and their relations.", "entities_count": len(entity_map)}


@router.get("/{world_id}/graph", response_model=GraphDataOut)
def get_graph(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if not world:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")

    entities = db.scalars(select(Entity).where(Entity.world_id == world.id, Entity.status == "ACTIVE")).all()
    relations = db.scalars(select(Relation).where(Relation.world_id == world.id, Relation.status == "ACTIVE")).all()

    return GraphDataOut(
        entities=[EntityOut.model_validate(e) for e in entities],
        relations=[RelationOut.model_validate(r) for r in relations]
    )