# AI World Model Builder — Project Handoff

**Project:** AI World Model Builder (GCUF FYP 2026–2027)
**Repo:** https://github.com/Arslanasif9t9/fyp-awmb
**Last updated:** [DATE]

This document is the single source of truth for decisions, phases, API surface, and current status. If code and this document disagree, this document wins — update the code or update this doc, never both silently.

---

## What this project is

A web app where a user creates a **World** (a container for a topic), uploads mixed files (PDF, images, tables, links, text), and the system builds a **structured, evidence-tagged, versioned model** of that world. The user can ask questions, view a timeline, detect contradictions, and run what-if simulations — **always grounded in stored evidence, never guessed**.

**Core rule:** The AI is NOT the world. The stored database is the world. Answers only from stored evidence.

---

## Core principles

1. **Append-only, versioned world.** Nothing is hard-deleted. Items are deactivated, not removed. History is preserved forever.
2. **Evidence-first.** Every claim in the world has a source (file or user claim), a reliability tier, and a timestamp.
3. **AI writes language, not truth.** The LLM handles language (parsing, phrasing). Decisions — evidence linking, contradictions, timeline — are code.
4. **Deterministic updates.** Same input → same output. No infinite loops, no silent guesses.
5. **Non-persistent what-if.** Simulations run on a temporary overlay and never modify the stored world unless the user explicitly applies the change.

---

## Decisions

- **Database:** Supabase Postgres. Free tier only. `pgvector` for embeddings (verify availability on free tier before Phase 4).
- **Tables:** Managed via Alembic migrations only. No manual schema edits.
- **Row Level Security (RLS):** ON for every table. Owner-scoped access.
- **AI providers (free only):** Gemini → Groq → Ollama (fallback chain).
- **Graph layer:** NetworkX + PostgreSQL first (entity/relation tables). Neo4j deferred unless scale demands it.
- **Frontend:** React. Premium UI/UX is a top priority — not an afterthought.
- **Backend runtime:** Python 3.12.
- **Deletion policy:** **Append-only. No hard delete.** Default behavior for any "remove" action is **deactivate** (soft hide), reversible via **reactivate**.
- **Prompt-based updates:** Prompt parsing may classify intent, but **destructive changes always require explicit user confirmation**. No auto-apply.
- **User claims:** User-provided text facts are stored as evidence with `reliability = MEDIUM` (below document-derived evidence, above verbal hearsay). Never presented as verified truth.
- **Edit fact:** User claims are editable. Editing creates a new claim and supersedes the old one (old claim status → `SUPERSEDED`).
- **What-if vs permanent change:** Two separate flows. What-if = overlay, no DB write. Permanent change = requires confirmation, goes through the update pipeline.
- **Contradiction resurrection:** When an item is deactivated, contradictions that were resolved by that item become `ACTIVE` again. This is expected behavior, not a bug.

---

## Status lifecycle (every item — file, evidence, entity, relation, contradiction)

| Status | Meaning | Visible in queries? | Retained in DB? |
|--------|---------|---------------------|-----------------|
| `ACTIVE` | Currently valid | Yes | Yes |
| `INACTIVE` | Deactivated by user | No | Yes |
| `SUPERSEDED` | Replaced by a newer version | No | Yes |
| `FAILED` | Processing failed | Error shown to user | Yes |

Every table that carries an item also carries: `status`, `superseded_by` (nullable FK), `deactivated_at` (nullable), `deactivated_by` (nullable FK to user).

---

## Allowed user actions (complete list)

The entire update surface is **5 actions**. No delete, no auto-replace, no prompt-driven destructive change.

| # | Action | Trigger | Result |
|---|--------|---------|--------|
| 1 | **Add File** | Upload button | New file + derived evidence created with `status=ACTIVE`. Entities/relations extracted. Contradictions re-detected. |
| 2 | **Add Fact** | Text box ("Add Fact") | New user claim stored as evidence with `source_type=user_claim`, `reliability=MEDIUM`, `status=ACTIVE`. Contradictions re-detected. |
| 3 | **Edit Fact** | Edit button on a user claim | Old claim → `SUPERSEDED`. New claim → `ACTIVE`. Contradictions re-detected. |
| 4 | **Deactivate** | Toggle on any item (file / evidence / fact) | Item → `INACTIVE`. Hidden from queries. Contradictions re-detected (resurrection possible). |
| 5 | **Reactivate** | Toggle on an `INACTIVE` item | Item → `ACTIVE`. Contradictions re-detected. |

**What-if simulation is NOT in this list** — it does not modify the world.

---

## Update pipeline (every action above goes through this)
[1] CLASSIFY → Which of the 5 actions is this?
↓
[2] VALIDATE → Permissions, input validity, locked data
↓
[3] PREVIEW → Show user what will change (for deactivate/edit, always)
↓
[4] CONFIRM → Explicit "Yes" required for: Deactivate, Edit Fact, and any prompt-driven change
↓
[5] APPLY → Write new records; old records → SUPERSEDED (never deleted)
↓
[6] CASCADE → Affected entities/relations updated to reflect new state
↓
[7] RE-DETECT → Contradictions re-checked (new + previously-resolved)
↓
[8] SNAPSHOT → World version incremented
↓
[9] LOG → change_log entry written
↓
[10] NOTIFY → User shown summary of what changed


This pipeline runs for every action, no exceptions.

---

## Planned API surface (additions to current `/auth`, `/worlds`, `/admin`)

All under `/worlds/{world_id}/...`, owner-scoped:

| Method | Path | Purpose | Phase |
|--------|------|---------|-------|
| `POST` | `/files` | Add File | 3 |
| `GET` | `/files` | List files (filter by status) | 3 |
| `POST` | `/files/{id}/deactivate` | Deactivate file | 3 |
| `POST` | `/files/{id}/reactivate` | Reactivate file | 3 |
| `POST` | `/facts` | Add Fact (user claim) | 4 |
| `PATCH` | `/facts/{id}` | Edit Fact (supersedes old) | 4 |
| `POST` | `/items/{type}/{id}/deactivate` | Generic deactivate (evidence, entity, relation) | 4 |
| `POST` | `/items/{type}/{id}/reactivate` | Generic reactivate | 4 |
| `GET` | `/history` | Change log (paginated, filterable) | 4 |
| `POST` | `/qa` | Ask a question (grounded answer + citations) | 5 |
| `GET` | `/timeline` | Timeline of events | 6 |
| `GET` | `/contradictions` | List contradictions (active + resolved) | 6 |
| `POST` | `/whatif` | Run a what-if simulation (non-persistent) | 7 |
| `GET` | `/snapshots` | List world versions | 8 (optional) |
| `POST` | `/snapshots/{id}/rollback` | Roll back to a snapshot (advanced) | 8 (optional) |

---

## Planned database tables (not yet implemented — reserved for Phases 3–4)

Current tables (implemented): `users`, `worlds`.

New tables to add via Alembic migration in Phase 3/4:

### `files`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `world_id` | UUID FK → worlds | cascade |
| `filename` | text | original name |
| `file_type` | text | pdf, image, xlsx, txt, url |
| `storage_path` | text | Supabase Storage path |
| `sha256` | text | dedup hash |
| `status` | text | ACTIVE / INACTIVE / FAILED |
| `uploaded_by` | UUID FK → users | |
| `uploaded_at` | timestamptz | |
| `deactivated_at` | timestamptz null | |
| `deactivated_by` | UUID FK → users null | |

### `evidence`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `world_id` | UUID FK → worlds | |
| `file_id` | UUID FK → files null | null when source_type = user_claim |
| `claim_text` | text | the extracted claim |
| `source_type` | text | file / user_claim |
| `reliability` | text | HIGH / MEDIUM / LOW |
| `chunk_ref` | text null | page/section reference |
| `status` | text | ACTIVE / INACTIVE / SUPERSEDED |
| `superseded_by` | UUID FK → evidence null | |
| `created_at` | timestamptz | |
| `deactivated_at` | timestamptz null | |
| `deactivated_by` | UUID FK → users null | |

### `change_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `world_id` | UUID FK → worlds | |
| `action` | text | ADD_FILE / ADD_FACT / EDIT_FACT / DEACTIVATE / REACTIVATE |
| `target_type` | text | file / evidence / entity / relation / contradiction |
| `target_id` | UUID | |
| `old_state` | text null | |
| `new_state` | text null | |
| `performed_by` | UUID FK → users | |
| `performed_at` | timestamptz | |
| `metadata` | jsonb | extra context (e.g., resurrection list) |

Future tables (Phase 5+): `entities`, `relations`, `contradictions`, `world_snapshots`, `embeddings`.

---

## Working rules (non-negotiable)

1. **No hard delete.** Any "remove" action is `deactivate`. Default and only behavior.
2. **No auto-apply of destructive prompt changes.** Intent may be classified by LLM, but a confirmation step is mandatory.
3. **No LLM-based permission checks.** Permissions come from code + DB. Never from a model.
4. **No full re-embed on every update.** Ingestion is incremental. Only new/changed content is embedded.
5. **No silent overwrite.** Every change writes a `change_log` row before returning success.
6. **Every answer must cite evidence.** If no evidence, the system says "not in stored data", never guesses.
7. **User claims are never presented as verified fact.** They carry `source_type=user_claim` and `reliability=MEDIUM`.
8. **What-if never touches the DB.** Overlay-only. Explicit "Apply" button converts to a permanent action through the update pipeline.

---

## Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Repo setup, docs, env | ✅ Done |
| 1 | Backend foundation: FastAPI, config, DB, `User`+`World`, auth (JWT+bcrypt), worlds CRUD, admin, Alembic, tests setup | ✅ Done (awaiting Supabase verification) |
| 2 | Frontend base: React app, auth flow, world list/create | ⏳ Next |
| 2.5 | Data model extension: add `files`, `evidence`, `change_log`, `user_claims` tables via Alembic (schemas only, no logic) | ⏳ Planned |
| 3 | Ingestion: file upload, parse (PDF/image/Excel/text/link), OCR, chunking, embeddings, job tracking; **Add File** action end-to-end | ⏳ Planned |
| 4 | Update system: Deactivate, Reactivate, Add Fact, Edit Fact; change log; history UI | ⏳ Planned |
| 5 | Q&A: retrieval + grounded answers + citations | ⏳ Planned |
| 6 | Entities/relations/timeline + contradiction detection & resurrection | ⏳ Planned |
| 7 | What-if simulation (non-persistent overlay) | ⏳ Planned |
| 8 | Snapshots, rollback, export (optional) | ⏳ Planned |
| 9+ | Premium UI polish, admin tools, deployment | ⏳ Planned |

**Note:** Phases are sequential for build order but may overlap slightly in planning. If time runs out, priority order for demo: 1 → 3 → 5 → 4 → 6 → 7.

---

## Current status

- Phase 1 complete: backend runs, auth works, world CRUD works, migrations apply.
- **Pending:** Supabase connection verification (Arslan to confirm).
- **Next action:** Begin Phase 2 (frontend base) in parallel with Phase 2.5 (schema design for `files`, `evidence`, `change_log`, `user_claims`).
- **Proposal PDF** needs revision to reflect append-only model, 5 actions, and non-persistent what-if. Source `.docx` required.

---

## Out of scope (for viva clarity)

- **Code assistant / code generation.** This is not Cursor/Copilot. The system handles documents, not codebases.
- **Prompt-driven auto destructive updates.** Prompts may be classified but never auto-applied.
- **Hard delete as a user-facing action.** Not present.
- **Training custom ML models.** Pretrained models only.
- **Real-time internet scraping beyond user-provided links.**
- **Video/audio ingestion** (deferred; may add later).
- **Multi-user collaboration on a single world** (single-owner per world in v1).

---

## Novelty (for viva)

> "Versioned, contradiction-aware, append-only world construction."

Existing tools (ChatGPT, NotebookLM, Notion AI) treat files independently and offer no unified, contradiction-aware, reversible model. This project:
- Unifies multiple files into one **stateful** world.
- **Detects contradictions** across sources rather than hiding them.
- Preserves full **history** (append-only) so any change is reversible and auditable.
- Separates **what-if overlays** from permanent state changes.
- Answers only from **stored, cited evidence** — no hallucination.

---

## How to run (unchanged, see README)

See `README.md` for setup, commands, and folder structure.

