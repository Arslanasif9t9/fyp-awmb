import uuid
from datetime import datetime
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
    func,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
import sqlalchemy as sa


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user", server_default="user")
    status: Mapped[str] = mapped_column(String(20), default="active", server_default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    worlds: Mapped[list["World"]] = relationship(back_populates="owner", cascade="all, delete-orphan", passive_deletes=True)


class World(Base):
    __tablename__ = "worlds"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    domain: Mapped[str] = mapped_column(String(50), default="general")
    purpose: Mapped[str] = mapped_column(Text)
    current_version: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner: Mapped[User] = relationship(back_populates="worlds")
    files: Mapped[list["File"]] = relationship(back_populates="world", cascade="all, delete-orphan", passive_deletes=True)
    evidence: Mapped[list["Evidence"]] = relationship(back_populates="world", cascade="all, delete-orphan", passive_deletes=True)
    changes: Mapped[list["ChangeLog"]] = relationship(back_populates="world", cascade="all, delete-orphan", passive_deletes=True)
    user_claims: Mapped[list["UserClaim"]] = relationship(back_populates="world", cascade="all, delete-orphan", passive_deletes=True)


# ---------------------------------------------------------------------------
# Phase 2.5 — Files, Evidence, ChangeLog, UserClaims
# ---------------------------------------------------------------------------

STATUS_CHECK = "status IN ('ACTIVE', 'INACTIVE', 'SUPERSEDED', 'FAILED')"


class File(Base):
    __tablename__ = "files"
    __table_args__ = (
        CheckConstraint(STATUS_CHECK, name="ck_files_status"),
        Index("ix_files_world_id", "world_id"),
        Index("ix_files_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    world_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255))
    file_type: Mapped[str] = mapped_column(String(50))  # pdf, image, xlsx, txt, url
    storage_path: Mapped[str] = mapped_column(Text)
    sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", server_default="ACTIVE")
    uploaded_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deactivated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deactivated_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)

    world: Mapped[World] = relationship(back_populates="files")
    evidence: Mapped[list["Evidence"]] = relationship(back_populates="file", cascade="all, delete-orphan", passive_deletes=True)


class Evidence(Base):
    __tablename__ = "evidence"
    __table_args__ = (
        CheckConstraint(STATUS_CHECK, name="ck_evidence_status"),
        CheckConstraint("reliability IN ('HIGH', 'MEDIUM', 'LOW')", name="ck_evidence_reliability"),
        CheckConstraint("source_type IN ('file', 'user_claim')", name="ck_evidence_source_type"),
        Index("ix_evidence_world_id", "world_id"),
        Index("ix_evidence_file_id", "file_id"),
        Index("ix_evidence_status", "status"),
        Index("ix_evidence_source_type", "source_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    world_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False)
    file_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("files.id", ondelete="SET NULL"), nullable=True)
    claim_text: Mapped[str] = mapped_column(Text)
    source_type: Mapped[str] = mapped_column(String(20), default="file", server_default="file")
    reliability: Mapped[str] = mapped_column(String(10), default="MEDIUM", server_default="MEDIUM")
    chunk_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", server_default="ACTIVE")
    superseded_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("evidence.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deactivated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deactivated_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)

    world: Mapped[World] = relationship(back_populates="evidence")
    file: Mapped[File | None] = relationship(back_populates="evidence")
    user_claim: Mapped["UserClaim | None"] = relationship(back_populates="evidence", uselist=False)


class UserClaim(Base):
    __tablename__ = "user_claims"
    __table_args__ = (
        CheckConstraint(STATUS_CHECK, name="ck_user_claims_status"),
        Index("ix_user_claims_world_id", "world_id"),
        Index("ix_user_claims_evidence_id", "evidence_id"),
        Index("ix_user_claims_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    world_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False)
    evidence_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("evidence.id", ondelete="CASCADE"), unique=True)
    created_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", server_default="ACTIVE")
    superseded_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("user_claims.id"), nullable=True)

    world: Mapped[World] = relationship(back_populates="user_claims")
    evidence: Mapped[Evidence] = relationship(back_populates="user_claim")


class ChangeLog(Base):
    __tablename__ = "change_log"
    __table_args__ = (
        Index("ix_change_log_world_id", "world_id"),
        Index("ix_change_log_action", "action"),
        Index("ix_change_log_performed_at", "performed_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    world_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(30))  # ADD_FILE, ADD_FACT, EDIT_FACT, DEACTIVATE, REACTIVATE
    target_type: Mapped[str] = mapped_column(String(30))  # file, evidence, entity, relation, contradiction
    target_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    old_state: Mapped[str | None] = mapped_column(String(20), nullable=True)
    new_state: Mapped[str | None] = mapped_column(String(20), nullable=True)
    performed_by: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    performed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    metadata_json: Mapped[dict | None] = mapped_column("metadata", sa.JSON, nullable=True)

    world: Mapped[World] = relationship(back_populates="changes")