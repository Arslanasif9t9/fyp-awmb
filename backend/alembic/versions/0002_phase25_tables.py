"""phase 2.5: files, evidence, change_log, user_claims

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-20
"""
import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- files ---
    op.create_table(
        "files",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("world_id", sa.Uuid(), sa.ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_type", sa.String(50), nullable=False),
        sa.Column("storage_path", sa.Text(), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        sa.Column("uploaded_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deactivated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deactivated_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.CheckConstraint("status IN ('ACTIVE', 'INACTIVE', 'SUPERSEDED', 'FAILED')", name="ck_files_status"),
    )
    op.create_index("ix_files_world_id", "files", ["world_id"])
    op.create_index("ix_files_status", "files", ["status"])

    # --- evidence ---
    op.create_table(
        "evidence",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("world_id", sa.Uuid(), sa.ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_id", sa.Uuid(), sa.ForeignKey("files.id", ondelete="SET NULL"), nullable=True),
        sa.Column("claim_text", sa.Text(), nullable=False),
        sa.Column("source_type", sa.String(20), nullable=False, server_default="file"),
        sa.Column("reliability", sa.String(10), nullable=False, server_default="MEDIUM"),
        sa.Column("chunk_ref", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        sa.Column("superseded_by", sa.Uuid(), sa.ForeignKey("evidence.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deactivated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deactivated_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.CheckConstraint("status IN ('ACTIVE', 'INACTIVE', 'SUPERSEDED', 'FAILED')", name="ck_evidence_status"),
        sa.CheckConstraint("reliability IN ('HIGH', 'MEDIUM', 'LOW')", name="ck_evidence_reliability"),
        sa.CheckConstraint("source_type IN ('file', 'user_claim')", name="ck_evidence_source_type"),
    )
    op.create_index("ix_evidence_world_id", "evidence", ["world_id"])
    op.create_index("ix_evidence_file_id", "evidence", ["file_id"])
    op.create_index("ix_evidence_status", "evidence", ["status"])
    op.create_index("ix_evidence_source_type", "evidence", ["source_type"])

    # --- user_claims ---
    op.create_table(
        "user_claims",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("world_id", sa.Uuid(), sa.ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False),
        sa.Column("evidence_id", sa.Uuid(), sa.ForeignKey("evidence.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("created_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        sa.Column("superseded_by", sa.Uuid(), sa.ForeignKey("user_claims.id"), nullable=True),
        sa.CheckConstraint("status IN ('ACTIVE', 'INACTIVE', 'SUPERSEDED', 'FAILED')", name="ck_user_claims_status"),
    )
    op.create_index("ix_user_claims_world_id", "user_claims", ["world_id"])
    op.create_index("ix_user_claims_evidence_id", "user_claims", ["evidence_id"])
    op.create_index("ix_user_claims_status", "user_claims", ["status"])

    # --- change_log ---
    op.create_table(
        "change_log",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("world_id", sa.Uuid(), sa.ForeignKey("worlds.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action", sa.String(30), nullable=False),
        sa.Column("target_type", sa.String(30), nullable=False),
        sa.Column("target_id", sa.Uuid(), nullable=False),
        sa.Column("old_state", sa.String(20), nullable=True),
        sa.Column("new_state", sa.String(20), nullable=True),
        sa.Column("performed_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("performed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("metadata", sa.JSON(), nullable=True),
    )
    op.create_index("ix_change_log_world_id", "change_log", ["world_id"])
    op.create_index("ix_change_log_action", "change_log", ["action"])
    op.create_index("ix_change_log_performed_at", "change_log", ["performed_at"])

    # --- Row Level Security (Supabase) ---
    if op.get_bind().dialect.name == "postgresql":
        for table in ("files", "evidence", "user_claims", "change_log"):
            op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_index("ix_change_log_performed_at", table_name="change_log")
    op.drop_index("ix_change_log_action", table_name="change_log")
    op.drop_index("ix_change_log_world_id", table_name="change_log")
    op.drop_table("change_log")

    op.drop_index("ix_user_claims_status", table_name="user_claims")
    op.drop_index("ix_user_claims_evidence_id", table_name="user_claims")
    op.drop_index("ix_user_claims_world_id", table_name="user_claims")
    op.drop_table("user_claims")

    op.drop_index("ix_evidence_source_type", table_name="evidence")
    op.drop_index("ix_evidence_status", table_name="evidence")
    op.drop_index("ix_evidence_file_id", table_name="evidence")
    op.drop_index("ix_evidence_world_id", table_name="evidence")
    op.drop_table("evidence")

    op.drop_index("ix_files_status", table_name="files")
    op.drop_index("ix_files_world_id", table_name="files")
    op.drop_table("files")