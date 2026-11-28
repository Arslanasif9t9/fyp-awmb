import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, Evidence, Contradiction
from ..services.ai_service import check_contradiction
from ..schemas import ContradictionOut

router = APIRouter(prefix="/worlds", tags=["Contradictions"])

@router.post("/{world_id}/detect-contradictions")
async def detect_contradictions(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if not world:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")

    # Purana data clear karo
    db.query(Contradiction).filter(Contradiction.world_id == world.id).delete()
    db.commit()

    evidences = db.scalars(select(Evidence).where(Evidence.world_id == world.id, Evidence.status == "ACTIVE")).all()
    
    contradictions_found = 0

    # Hum har chunk ko uske sab se qareebi (similar) chunk se compare karenge
    # Taake O(N^2) loops se bacha ja sake
    for i, ev1 in enumerate(evidences):
        if not ev1.embedding: continue
        
        # Find 1 most similar chunk (excluding itself)
        similar = db.scalars(
            select(Evidence)
            .where(
                Evidence.world_id == world.id,
                Evidence.id != ev1.id,
                Evidence.status == "ACTIVE",
                Evidence.embedding.isnot(None)
            )
            .order_by(Evidence.embedding.cosine_distance(ev1.embedding))
            .limit(1)
        ).first()

        if similar:
            # AI se poocho
            result = await check_contradiction(ev1.claim_text, similar.claim_text)
            
            if result.get("is_contradiction"):
                new_cont = Contradiction(
                    world_id=world.id,
                    evidence_1_id=ev1.id,
                    evidence_2_id=similar.id,
                    explanation=result.get("explanation", "Conflict detected.")
                )
                db.add(new_cont)
                contradictions_found += 1
                db.commit()

    return {"message": "Detection complete", "contradictions_found": contradictions_found}


@router.get("/{world_id}/contradictions", response_model=list[ContradictionOut])
def get_contradictions(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if not world:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")

    conts = db.scalars(
        select(Contradiction)
        .where(Contradiction.world_id == world.id, Contradiction.status == "ACTIVE")
        .order_by(Contradiction.created_at.desc())
    ).all()

    result = []
    for c in conts:
        ev1 = db.scalar(select(Evidence).where(Evidence.id == c.evidence_1_id))
        ev2 = db.scalar(select(Evidence).where(Evidence.id == c.evidence_2_id))
        
        result.append(ContradictionOut(
            id=c.id,
            explanation=c.explanation,
            evidence_1_text=ev1.claim_text if ev1 else "Deleted",
            evidence_2_text=ev2.claim_text if ev2 else "Deleted",
            status=c.status,
            created_at=c.created_at
        ))
    return result