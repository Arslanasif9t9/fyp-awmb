import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, Evidence
from ..schemas import QARequest, QAResponse, EvidenceOut
from ..services.embedder import get_embedding
from ..services.ai_service import generate_answer

router = APIRouter(prefix="/worlds", tags=["Q&A"])

def _get_own_world(db: Session, user: User, world_id: uuid.UUID) -> World:
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if world is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")
    return world

@router.post("/{world_id}/qa", response_model=QAResponse)
def ask_question(
    world_id: uuid.UUID,
    data: QARequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = _get_own_world(db, user, world_id)
    
    # 1. Sawal ko vector (embedding) mein convert karo
    question_embedding = get_embedding(data.question)
    
    if not question_embedding:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not process the question.")

    # 2. Database mein Semantic Search chalao (Cosine Distance)
    # Hum sirf ACTIVE evidence dhoondenge aur top 5 sab se related chunks lenge
    relevant_evidence = db.scalars(
        select(Evidence)
        .where(
            Evidence.world_id == world.id,
            Evidence.status == "ACTIVE",
            Evidence.embedding.isnot(None) # Sirf un chunks ke liye jinka embedding bana hai
        )
        .order_by(Evidence.embedding.cosine_distance(question_embedding))
        .limit(5)
    ).all()

    if not relevant_evidence:
        return QAResponse(
            answer="I cannot find any evidence in this world to answer your question. Please upload files first.",
            citations=[]
        )

    # 3. Context chunks nikaalo
    context_chunks = [ev.claim_text for ev in relevant_evidence]

    # 4. AI se jawab mangwao
    ai_answer = generate_answer(data.question, context_chunks)

    # 5. Response return karo (citations ke sath)
    return QAResponse(
        answer=ai_answer,
        citations=[EvidenceOut.model_validate(ev) for ev in relevant_evidence]
    )