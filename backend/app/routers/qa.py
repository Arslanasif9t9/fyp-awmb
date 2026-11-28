import uuid
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, Evidence
from ..schemas import QARequest, EvidenceOut
from ..services.embedder import get_embedding
from ..services.ai_service import generate_answer_async

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
            yield f"data: {json.dumps({'type': 'status', 'message': 'Understanding your question...'})}\n\n"

            # Embedding (run in thread so it doesn't block event loop)
            question_embedding = await asyncio.to_thread(get_embedding, data.question)

            yield f"data: {json.dumps({'type': 'status', 'message': 'Searching your evidence...'})}\n\n"

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
                yield f"data: {json.dumps({'type': 'error', 'message': 'No evidence found. Upload files first.'})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                return

            context_chunks = [ev.claim_text for ev in relevant_evidence]
            citations_data = [EvidenceOut.model_validate(ev).model_dump(mode='json') for ev in relevant_evidence]

            yield f"data: {json.dumps({'type': 'status', 'message': 'AI is analyzing your evidence...'})}\n\n"

            # Async call with timeout - no blocking
            answer = await generate_answer_async(data.question, context_chunks)

            # Simulate streaming (word chunks) for typing feel
            words = answer.split(' ')
            buffer = ''
            for i, word in enumerate(words):
                buffer += word + ' '
                if (i + 1) % 3 == 0 or i == len(words) - 1:
                    yield f"data: {json.dumps({'type': 'token', 'text': buffer})}\n\n"
                    buffer = ''
                    await asyncio.sleep(0.03)

            yield f"data: {json.dumps({'type': 'citations', 'data': citations_data})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            print(f"[QA Stream Error] {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")