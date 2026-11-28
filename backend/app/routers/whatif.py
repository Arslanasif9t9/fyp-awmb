import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, Evidence, File as DBFile
from ..schemas import WhatIfRequest, WhatIfResponse, WhatIfCitation
from ..services.embedder import get_embedding
from ..services.ai_service import simulate_whatif

router = APIRouter(prefix="/worlds", tags=["What-If"])

@router.post("/{world_id}/whatif", response_model=WhatIfResponse)
async def run_whatif(
    world_id: uuid.UUID,
    data: WhatIfRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if not world:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")
    
    # Assumption ko embed karo aur relevant evidence dhoondo
    assumption_embedding = get_embedding(data.assumption)
    if not assumption_embedding:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not process assumption")
    
    relevant = db.scalars(
        select(Evidence)
        .where(
            Evidence.world_id == world.id,
            Evidence.status == "ACTIVE",
            Evidence.embedding.isnot(None)
        )
        .order_by(Evidence.embedding.cosine_distance(assumption_embedding))
        .limit(5)
    ).all()
    
    if not relevant:
        return WhatIfResponse(
            assumption=data.assumption,
            first_order=[],
            second_order=[],
            confidence="LOW",
            reasoning="No evidence available to simulate this scenario.",
            citations=[],
            disclaimer="This is a simulation. Your world has not been modified."
        )
    
    context_chunks = [ev.claim_text for ev in relevant]
    result = await simulate_whatif(data.assumption, context_chunks)
    
    # Citations build karo (file name ke saath)
    citations = []
    for ev in relevant:
        file_name = None
        if ev.file_id:
            f = db.scalar(select(DBFile).where(DBFile.id == ev.file_id))
            file_name = f.filename if f else None
        citations.append(WhatIfCitation(
            claim_text=ev.claim_text[:200] + "..." if len(ev.claim_text) > 200 else ev.claim_text,
            source_file=file_name,
            chunk_ref=ev.chunk_ref
        ))
    
    return WhatIfResponse(
        assumption=data.assumption,
        first_order=result.get("first_order", []),
        second_order=result.get("second_order", []),
        confidence=result.get("confidence", "LOW"),
        reasoning=result.get("reasoning", ""),
        citations=citations,
        disclaimer="This is a simulation. Your world has not been modified. No files, evidence, or entities were changed."
    )