# HANDOFF (keep this updated after every phase)

## Project
AI World Model Builder. Turns mixed files (text, PDF, image, Excel, links) into a persistent,
evidence-tagged, versioned "world" (graph). Supports contradiction detection, grounded Q&A
with citations, and what-if simulation. No foundation model is trained.

Core rule: the AI is NOT the world. The stored database is the world. Answers only from stored evidence.

## Team
Arslan, Husnain, Zubair. Supervisor: Sir Romat Ali Shah. GCUF, BSIT, 2026-2027.

## Names
- GitHub repo: `fyp-awmb`
- Supabase project: `fyp-awmb`

## Decisions so far
- Run local first, deploy live later.
- Database: Supabase Postgres (use the Session pooler connection string, not the direct one).
  pgvector extension enabled in Supabase for later Q&A.
- Tables are created only by Alembic migrations (never by hand).
- Row Level Security is ON for every table (no policies). This blocks Supabase's public REST API.
  The backend connects as the table owner, so it still works.
- AI: free only. Router order: Gemini -> Groq -> Ollama (local, slow, backup).
- Graph: NetworkX + PostgreSQL first, Neo4j later (optional).
- Frontend: React, premium UI/UX is the top priority.
- Backend runs on Python 3.12 (`py -3.12`). The laptop default is 3.15, do not use it for the backend.
- Docker is not installed now. `docker-compose.yml` is kept for later (live deploy, Neo4j).
- Quality must not be compromised. Every fact has source + confidence + status.

## Phases
0 Setup | 1 Backend+Auth+DB | 2 Frontend base + design system | 3 Text/PDF ingestion |
4 World construction (AI) | 5 Evidence + versions | 6 Contradiction + update |
7 Graph/Timeline/Evidence UI | 8 Grounded Q&A | 9 What-if | 10 Image/Excel/Links |
11 Domain adapters (News, Traffic) | 12 Agent simulation (small) | 13 Reports/Admin/Logs |
14 Testing + polish + docs

## Status
- [x] Phase 0: folder, docs, repo, Supabase project
- [x] Phase 1: backend, auth, world CRUD (code done, waiting for Arslan's test on Supabase)
- [ ] Phase 2: next (frontend base + design system)

## How to run (Windows, PowerShell, in the project root)
```
.\awmb setup      # first time
.\awmb migrate    # create tables in Supabase
.\awmb admin      # create admin user (asks email and password)
.\awmb run        # http://localhost:8000/docs
.\awmb test       # 2 essential tests (use a temporary SQLite file, never Supabase)
```

## Backend layout (`backend/`)
- `app/main.py` app, CORS, health
- `app/config.py` settings from `.env` (root folder)
- `app/database.py` engine and session
- `app/models.py` `User`, `World`
- `app/schemas.py` request/response models, allowed domains
- `app/security.py` password hash (bcrypt) and JWT
- `app/deps.py` current user, admin check
- `app/routers/` `auth.py`, `worlds.py`, `admin.py`
- `app/cli.py` `create-admin`
- `alembic/versions/` migrations (`0001` = users + worlds)
- `tests/` 2 essential tests

## API (prefix `/api`)
| Method | Path | Who | What |
|---|---|---|---|
| GET | /health | public | API and DB status |
| POST | /auth/register | public | Create user (role `user`), returns token |
| POST | /auth/login | public | Form fields `username` (email) and `password`, returns token |
| GET | /auth/me | user | Current user |
| POST | /worlds | user | Create world (name, domain, purpose) |
| GET | /worlds | user | List own worlds (newest first) |
| GET | /worlds/{id} | user | One own world |
| DELETE | /worlds/{id} | user | Delete own world |
| GET | /admin/users | admin | List all users |

Notes:
- Another user's world returns 404 (same as missing), never 403.
- Allowed `domain` values: `general`, `news_incident`, `city_traffic` (in `schemas.py`).
- Login uses form data (OAuth2 standard) so the Authorize button in `/docs` works.

## Database tables
- `users`: id, name, email (unique), password_hash, role (`user`/`admin`), status, created_at
- `worlds`: id, user_id (FK, cascade delete), name, domain, purpose, current_version, created_at, updated_at

## Next
Phase 2: React frontend with a premium design system (login, world list, create world).

## Working rules
- Only essential tests.
- Make small, surgical changes. Do not touch working code.
- Update this file after every phase.
