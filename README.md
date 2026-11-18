# AI World Model Builder (fyp-awmb)

An Autonomous Multimodal World Intelligence and Simulation Engine (GCUF FYP, 2026–2027).

Turns mixed files (text, PDF, images, tables, links) into a **persistent, evidence-tagged, versioned "world"**. Users can question it, detect contradictions, and test "what if" ideas — always grounded in stored evidence, never guessed.

**Core principle:** The AI is NOT the world. The stored database is the world. Answers only from stored evidence.

---

## Key ideas

- **Append-only world.** Nothing is hard-deleted. Items are deactivated and can be reactivated. Full history is preserved.
- **Evidence-first.** Every claim has a source (file or user claim), a reliability tier, and a timestamp.
- **Contradiction-aware.** When two sources disagree, the system flags it instead of hiding it.
- **Non-persistent what-if.** Simulations run on a temporary overlay and never modify the stored world unless explicitly applied.

---

## Folder structure

- `backend/` — FastAPI app (API, auth, world engine)
- `frontend/` — React app (premium UI) — Phase 2
- `docs/` — Handoff, phases, decisions (start with `docs/HANDOFF.md`)
- `awmb.bat` — Short commands for Windows
- `docker-compose.yml` — Optional local PostgreSQL (not used now)
- `.env.example` — Copy to `.env` and fill

---

## Requirements

- Python 3.12 (`py -3.12`)
- Git
- A free Supabase project (Postgres)

---

## Quick start

Open PowerShell in this folder:

```powershell
.\awmb setup      # first time: venv + packages (creates .env if missing)
# open .env and fill DATABASE_URL and JWT_SECRET
.\awmb migrate    # create database tables
.\awmb admin      # create the admin user
.\awmb run        # start backend -> http://localhost:8000/docs
```

Other commands: `.\awmb test` (run tests).

---

## Status

- **Phase 1 complete:** backend foundation, auth (JWT + bcrypt), world CRUD, migrations.
- **Next:** Phase 2 (frontend base) + Phase 2.5 (schema for `files`, `evidence`, `change_log`, `user_claims`).
- **Full plan, decisions, and API list:** see [`docs/HANDOFF.md`](docs/HANDOFF.md).

---

## Documentation

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — single source of truth for decisions, phases, API surface, and status.
- `AI_World_Model_Builder_FYP_Proposal.pdf` — full FYP proposal (scope, objectives, requirements).