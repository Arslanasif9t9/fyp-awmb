# AI World Model Builder (fyp-awmb)

An Autonomous Multimodal World Intelligence and Simulation Engine (GCUF FYP, 2026-2027).

Turns mixed files (text, PDF, images, tables, links) into a persistent, evidence-tagged,
versioned "world". Users can question it and test "what if" ideas.

## Folder structure

- `backend/`   FastAPI app (API, auth, world engine)
- `frontend/`  React app (premium UI) - Phase 2
- `docs/`      Handoff, phases, decisions
- `awmb.bat`   Short commands for Windows
- `docker-compose.yml`  Optional local PostgreSQL (not used now)
- `.env.example`        Copy to `.env` and fill

## Requirements

- Python 3.12 (`py -3.12`)
- Git
- A free Supabase project (Postgres)

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

## Status

See `docs/HANDOFF.md` for the current phase, decisions and API list.
