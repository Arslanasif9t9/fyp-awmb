import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, Evidence
from ..schemas import QARequest, EvidenceOut
from ..services.embedder import get_embedding
from ..services.ai_service import generate_answer_stream

router = APIRouter(prefix="/worlds", tags=["Q&A"])

def _get_own_world(db: Session, user: User, world_id: uuid.UUID) -> World:
    world = db.scalar(select(World).where(World.id == world_id, World.user_id == user.id))
    if world is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")
    return world

@router.post("/{world_id}/qa-stream")
async def ask_question_stream(
    world_id: uuid.UUID,
    data: QARequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = _get_own_world(db, user, world_id)
    
    async def event_generator():
        try:
            # Stage 1: Embedding (Thinking)
            yield f"data: {json.dumps({'type': 'status', 'message': 'Understanding your question...'})}\n\n"
            question_embedding = get_embedding(data.question)
            
            # Stage 2: Searching DB
            yield f"data: {json.dumps({'type': 'status', 'message': 'Searching evidence...'})}\n\n"
            relevant_evidence = db.scalars(
                select(Evidence)
                .where(
                    Evidence.world_id == world.id,
                    Evidence.status == "ACTIVE",
                    Evidence.embedding.isnot(None)
                )
                .order_by(Evidence.embedding.cosine_distance(question_embedding))
                .limit(5)
            ).all()

            if not relevant_evidence:
                yield f"data: {json.dumps({'type': 'error', 'message': 'No evidence found. Please upload files first.'})}\n\n"
                return

            context_chunks = [ev.claim_text for ev in relevant_evidence]
            citations_data = [EvidenceOut.model_validate(ev).model_dump(mode='json') for ev in relevant_evidence]

            # Stage 3: AI Generation
            yield f"data: {json.dumps({'type': 'status', 'message': 'AI is thinking...'})}\n\n"
            
            # Stream tokens
            for text_chunk in generate_answer_stream(data.question, context_chunks):
                yield f"data: {json.dumps({'type': 'token', 'text': text_chunk})}\n\n"

            # Stage 4: Send Citations
            yield f"data: {json.dumps({'type': 'citations', 'data': citations_data})}\n\n"
            
            # Done
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")