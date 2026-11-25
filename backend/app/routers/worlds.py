import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, World, ChangeLog
from ..schemas import WorldCreate, WorldOut, ChangeLogOut
from sqlalchemy import select, desc

router = APIRouter(prefix="/worlds", tags=["Worlds"])


def _get_own_world(db: Session, user: User, world_id: uuid.UUID) -> World:
    # Another user's world looks exactly like a missing one (404, not 403).
    world = db.scalar(
        select(World).where(World.id == world_id, World.user_id == user.id)
    )
    if world is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "World not found")
    return world


@router.post("", response_model=WorldOut, status_code=status.HTTP_201_CREATED)
def create_world(
    data: WorldCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = World(
        user_id=user.id, name=data.name, domain=data.domain, purpose=data.purpose
    )
    db.add(world)
    db.commit()
    db.refresh(world)
    return world


@router.get("", response_model=list[WorldOut])
def list_worlds(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(World).where(World.user_id == user.id).order_by(World.created_at.desc())
    ).all()


@router.get("/{world_id}", response_model=WorldOut)
def get_world(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_own_world(db, user, world_id)


@router.delete("/{world_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_world(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = _get_own_world(db, user, world_id)
    db.delete(world)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{world_id}/history", response_model=list[ChangeLogOut])
def get_world_history(
    world_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    world = _get_own_world(db, user, world_id)
    return db.scalars(
        select(ChangeLog)
        .where(ChangeLog.world_id == world.id)
        .order_by(ChangeLog.performed_at.desc())
    ).all()

