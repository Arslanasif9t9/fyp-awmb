# AI World Model Builder — Project Guide

**Audience:** New team members, future maintainers, viva preparation, anyone who needs to understand this project from zero.

**Reading time:** ~30 minutes for full read. Sections 1–5 are essential; rest is reference.

**If you read only one section:** read Section 6 (Real Scenario Walkthrough). It makes everything concrete.

---

## Table of Contents

1. Elevator Pitch
2. The Problem We Solve
3. Core Concepts (Vocabulary)
4. The Solution — How It Works
5. Append-Only Model (Our Core Design Choice)
6. Real Scenario Walkthrough — Ahmed's House Purchase
7. System Architecture
8. Data Model
9. User Flows (All 5 Actions)
10. Tech Stack
11. Phases / Roadmap
12. How to Continue (For New Developers)
13. FAQ — Viva Preparation
14. Glossary
15. References

---

## 1. Elevator Pitch

**AI World Model Builder** is a web platform that turns scattered, mixed-format information (PDFs, images, tables, links, text) into a **single, persistent, evidence-tagged, versioned "world"** — a structured digital model of a real situation.

Users can:
- Ask questions and get answers **with cited evidence** (never guessed)
- See **contradictions** between sources, highlighted automatically
- View a **timeline** of how the situation evolved
- Run **"what-if" simulations** without changing the stored world
- **Deactivate** anything they don't trust (reversible — nothing is deleted)

**Core rule:** *The AI is not the world. The stored database is the world. Answers only from stored evidence.*

---

## 2. The Problem We Solve

Anyone trying to understand a complex situation — a research topic, an incident, a property decision, a market — faces the same mess:

- **Information is scattered** across 10 different files, 5 formats, 3 apps
- **Sources disagree** — and nobody flags it
- **The picture changes** over time, but old notes and dashboards don't track the evolution
- **ChatGPT and similar tools** answer fluently but can't show you *where* the answer came from
- **You can't safely experiment** — "what if X changed?" needs manual reasoning
- **Nothing is auditable** — you can't prove why you trusted one source over another

The result: **weeks of manual cross-checking, or worse — a bad decision made on incomplete information.**

Existing tools solve *parts* of this:
- Document analyzers read one file at a time
- Chatbots answer from a session, then forget
- Note-taking apps store text but don't reason

**Nobody unifies them into one stateful, contradiction-aware, reversible system.** That's our gap.

---

## 3. Core Concepts (Vocabulary)

Master these 8 terms and you understand the whole project.

### 3.1 World
A **container** for one topic. Every file, fact, entity, and relation lives inside a World.

Examples: *"My FYP Research"*, *"Pakistan Energy Sector 2024"*, *"Ahmed's House Search"*.

A World has an owner, a name, a purpose, and a version history.

### 3.2 Entity
A **thing** in the world — a person, place, organization, object, concept, or event.

Examples: *"Property A"*, *"Agent Imran"*, *"Meezan Bank"*, *"Seepage issue"*.

### 3.3 Relation
A **connection** between two entities.

Examples: *"Agent Imran → represents → Property B"*, *"Lawyer → warns_about → Property B"*.

### 3.4 Evidence
A **claim** extracted from a source, with attached metadata.

Every evidence item carries:
- `claim_text` — what was said
- `source` — which file or user claim it came from
- `reliability` — HIGH / MEDIUM / LOW
- `timestamp` — when it entered the world
- `status` — ACTIVE / INACTIVE / SUPERSEDED

**No evidence = no answer.** The system refuses to guess.

### 3.5 Contradiction
A **conflict** between two pieces of evidence.

Example: Agent says *"title clear"*; Lawyer says *"mutation missing"*. Both stored, both visible, both cited. **The system never silently picks one** — it shows the conflict and lets the user decide.

### 3.6 Timeline
A **chronological view** of events and state changes in a World. When new evidence arrives, it's placed in time order. You can slide back to see how the world looked earlier.

### 3.7 Status Lifecycle
Every item carries a status. This is the foundation of the append-only model (Section 5).

| Status | Meaning | Visible in queries? | Still in DB? |
|--------|---------|---------------------|--------------|
| `ACTIVE` | Currently valid | Yes | Yes |
| `INACTIVE` | Deactivated by user | No | Yes |
| `SUPERSEDED` | Replaced by a newer version | No | Yes |
| `FAILED` | Processing failed | Error shown | Yes |

### 3.8 What-If Simulation
A **non-persistent** experiment. You assume something is different ("what if the budget were 2 crore?"), and the system shows what would change — **without touching the stored world**.

Only if you click "Apply" does it become a real change (through the update pipeline).

---

## 4. The Solution — How It Works

### 4.1 Four Layers

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION       Web UI — graphs, timeline, Q&A, reports │
├─────────────────────────────────────────────────────────────┤
│  REASONING &        Q&A with citations, what-if, predictions│
│  SIMULATION                                                  │
├─────────────────────────────────────────────────────────────┤
│  WORLD MEMORY       Entities, relations, evidence, versions │
├─────────────────────────────────────────────────────────────┤
│  PERCEPTION         Text, PDF, image, table, link → data    │
└─────────────────────────────────────────────────────────────┘
```

- **Perception** reads raw input (OCR, PDF parsing, image captioning)
- **World Memory** stores structured knowledge with evidence tags
- **Reasoning** answers questions and runs simulations — **only from stored evidence**
- **Presentation** shows it all to the user

### 4.2 The 6-Step Loop

Every new piece of information goes through:

```
1. INGEST    →  File or fact arrives
2. PERCEIVE  →  Extract text/structure
3. CONSTRUCT →  Build entities, relations, evidence
4. REASON    →  Answer questions from this
5. SIMULATE  →  Run what-if scenarios
6. UPDATE    →  Append new state, mark old as superseded
```

**Update is append-only.** Nothing is destroyed. See Section 5.

### 4.3 Five User Actions

The **entire** update surface is 5 actions. No delete. No auto-replace. No prompt-driven destruction.

| Action | What It Does |
|--------|--------------|
| **Add File** | Upload a new document; ingest it; extract evidence |
| **Add Fact** | Type a fact manually; stored as user claim (reliability = MEDIUM) |
| **Edit Fact** | Modify a previous user claim; old → SUPERSEDED, new → ACTIVE |
| **Deactivate** | Hide an item (file, evidence, fact); item → INACTIVE; reversible |
| **Reactivate** | Restore an INACTIVE item; item → ACTIVE |

Everything else (delete, replace, prompt-driven destructive change) is **intentionally excluded**.

---

## 5. Append-Only Model (Our Core Design Choice)

This is the single most important design decision. Understand it, and everything else makes sense.

### 5.1 The Rule

> **Nothing is ever hard-deleted. Every change is an append.**

When the user "removes" something, the system marks it `INACTIVE` — hidden from queries, but still in the database. It can be restored any time.

When new information replaces old, the old becomes `SUPERSEDED` — the new one takes over.

### 5.2 Why This Matters

| If We Hard-Deleted | With Append-Only |
|---------------------|-------------------|
| What-if can't use past states | What-if can rewind to any point |
| No audit trail | Every action logged |
| No undo | Every action reversible |
| Cascade delete chaos (what about relations? evidence? contradictions?) | Just flip a status flag |
| Data loss if bug | Data never lost |
| Trust problem — user doesn't know what happened | Full history visible |

### 5.3 How It Works — Example

**Scenario:** Ahmed uploaded a lawyer's email saying *"Property B's mutation is missing."* Two days later, the mutation is found. He wants to deactivate the email.

**What happens internally:**
1. Email record → `status = INACTIVE`
2. Evidence from that email → `status = INACTIVE`
3. Queries stop returning this evidence
4. Contradictions that this email had resolved → become `ACTIVE` again (because the email that resolved them is gone)
5. `change_log` gets a new row: `{action: "DEACTIVATE", target: "email_id_123", old_state: "ACTIVE", new_state: "INACTIVE"}`
6. World version increments
7. User sees a summary

**The original email is still in the database.** Two weeks later, if the user clicks "Reactivate", everything flips back: `INACTIVE → ACTIVE`, contradictions re-resolve, version increments again.

### 5.4 Contradiction Resurrection

When you deactivate evidence, contradictions it had resolved come back. This is **intentional**, not a bug.

Example:
- Monday: Agent says "title clear" → title is uncertain (only one source)
- Tuesday: Lawyer says "mutation missing" → contradiction flagged
- Wednesday: Mutation document uploaded → contradiction resolved (title now confirmed clear)
- Thursday: Lawyer email deactivated → contradiction comes BACK

The system shows this explicitly. It doesn't silently decide.

### 5.5 What About User-Provided Facts?

User facts ("the loan is 1.3 crore") are treated as evidence too — but tagged with:
- `source_type = user_claim`
- `reliability = MEDIUM` (below documents, above hearsay)

They can be edited (old → SUPERSEDED, new → ACTIVE). They appear in answers with an explicit "you said this" tag — never presented as verified truth.

---

## 6. Real Scenario Walkthrough — Ahmed's House Purchase

This makes everything concrete.

### The Situation

**Ahmed** (30, software engineer, Lahore) wants to buy his first home. Budget: 1.5 crore. He has **12 scattered pieces of information**:

| # | What | Format |
|---|------|--------|
| 1 | Property A listing (DHA Phase 5) | PDF |
| 2 | Property B listing (Bahria Town) | WhatsApp screenshots |
| 3 | Property C listing (Johar Town) | Facebook link |
| 4 | Agent Imran's chats | WhatsApp screenshots |
| 5 | Bank loan brochure | PDF |
| 6 | Salary slips (6 months) | PDF |
| 7 | Bank statement | Excel |
| 8 | Wife's message ("seepage issue") | Text |
| 9 | Parents' advice ("security") | Text |
| 10 | Property B legal papers | Images |
| 11 | Lawyer email ("mutation missing") | Forwarded text |
| 12 | Property A tour video | YouTube link |

In the old world, Ahmed juggles 5 apps and 3 weeks. Contradictions hide. Decision is delayed or wrong.

### With AI World Model Builder

**Step 1 — Create a World**
Ahmed creates: *"My First Home — Lahore 2026"*. Purpose: *"Compare 3 properties within budget."*

**Step 2 — Upload Files**
He uploads all 12 sources. The system:
- Detects format for each
- Extracts text (PDF parsing, OCR for screenshots, Excel parsing, link scraping)
- Chunks text
- Embeds for retrieval
- Extracts entities (Property A, Property B, Agent Imran, Meezan Bank, Mutation issue)
- Extracts relations (`Agent → represents → Property B`, `Lawyer → warns_about → Property B`)
- Attaches evidence to each fact
- Runs contradiction detection on first pass

**Step 3 — System Reports**
```
✅ 12 files processed
⚠️ 3 contradictions found:
   1. Property B title: "clear" (Agent) vs "missing" (Lawyer)
   2. Property B condition: "no issues" (Agent) vs "seepage" (Wife)
   3. Budget gap: need 1.5 crore, loan offer only 1.2 crore
```

**Step 4 — Ahmed Explores**
- Clicks Property B node → sees graph of all relations, all evidence, both sides of each contradiction
- Views timeline: 10 Nov (Property A listed) → 12 Nov (Agent B) → 13 Nov (Lawyer warning) → 14 Nov (Wife sees seepage) → 15 Nov (Bank offer) → 16 Nov (Parents)

**Step 5 — Ahmed Asks Questions**

*Q: "Is Property B's title clear?"*
```
⚠️ CONTRADICTION
Source 1 — Agent Imran, 12 Nov: "Title clear" [LOW reliability, verbal]
Source 2 — Lawyer, 13 Nov: "Mutation missing" [HIGH reliability, legal doc]
System recommendation: Lawyer is more reliable. Verify mutation before proceeding.
```

*Q: "Which property fits my budget?"*
```
Property A: 1.4 crore ✅ within budget
Property B: 1.3 crore ✅ but has title + seepage issues
Property C: 1.35 crore ✅ but parents concerned about security
Recommendation: Property A is safest — no contradictions, budget, location ok.
```

**Step 6 — What-If Experiments**

*"What if the bank only gives 1 crore?"* → System shows: all 3 properties become unaffordable; need to look for cheaper options.

*"What if the lawyer's mutation concern is resolved?"* → System shows: Property B still has seepage issue; still risky.

*Note: None of this changes the stored world. Ahmed can run 10 what-ifs.*

**Step 7 — Ahmed Makes a Decision**
He visits Property A. No contradictions. Budget fits. Decision made in **3 days instead of 3 weeks**.

**Step 8 — Later, an Update**
After the visit, Ahmed's wife confirms Property A has no seepage. He adds a fact: *"Property A: wife confirmed no seepage on visit, 22 Nov."* → Stored as user claim (reliability MEDIUM), timeline updated, contradiction check re-runs.

---

## 7. System Architecture

### 7.1 Component Map

```
┌──────────────┐
│   Browser    │  React frontend
└──────┬───────┘
       │ HTTPS
┌──────▼───────┐
│  FastAPI     │  REST API
│  Backend     │  Auth (JWT), Worlds, Files, Facts
└──────┬───────┘
       │
  ┌────┴────┬──────────┬─────────────┐
  ▼         ▼          ▼             ▼
┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│Percep│ │World   │ │Reasoning│ │Simulation│
│tion  │ │Memory  │ │+ Q&A    │ │+ What-if │
└──┬───┘ └───┬────┘ └────┬────┘ └────┬─────┘
   │         │           │           │
   ▼         ▼           ▼           ▼
┌─────────────────────────────────────────┐
│     Supabase Postgres + pgvector        │
│  users, worlds, files, evidence,        │
│  entities, relations, contradictions,   │
│  change_log, user_claims                │
└─────────────────────────────────────────┘
```

### 7.2 AI Provider Chain

Free tier only. Fallback chain: **Gemini → Groq → Ollama**.

- **Gemini** (Google) — primary, free tier
- **Groq** — fast fallback, free tier
- **Ollama** — local, no API needed

Each provider wrapped in a small adapter; system picks the first available.

### 7.3 Graph Layer

**Phase 1:** Entities and relations stored in **PostgreSQL** tables (adjacency list style) + **NetworkX** in memory for traversal.

**Future:** Neo4j if scale demands.

For FYP scale, Postgres tables are plenty fast.

---

## 8. Data Model

### 8.1 Current Tables (Implemented — Phase 1)

**`users`**
- id, email, hashed_password, role (user/admin), created_at

**`worlds`**
- id, owner_id (FK users), name, description, domain, created_at, updated_at

### 8.2 Planned Tables (Phases 2.5–4)

**`files`**
- id, world_id, filename, file_type, storage_path, sha256, status, uploaded_by, uploaded_at, deactivated_at, deactivated_by

**`evidence`**
- id, world_id, file_id (nullable for user claims), claim_text, source_type (file/user_claim), reliability (HIGH/MEDIUM/LOW), chunk_ref, status, superseded_by, created_at, deactivated_at, deactivated_by

**`change_log`**
- id, world_id, action, target_type, target_id, old_state, new_state, performed_by, performed_at, metadata (jsonb)

**`user_claims`** *(may be merged into evidence with source_type=user_claim)*
- id, world_id, claim_text, created_by, created_at, status, superseded_by

### 8.3 Future Tables (Phases 5+)

- `entities` — extracted entities with status
- `relations` — entity-to-entity links with validity
- `contradictions` — detected conflicts with status
- `world_snapshots` — full world state per version (for rollback)
- `embeddings` — chunk vectors (or use pgvector column on evidence)

---

## 9. User Flows (All 5 Actions)

Every flow goes through the **10-step update pipeline**:

```
Classify → Validate → Preview → Confirm → Apply → Cascade → Re-detect → Snapshot → Log → Notify
```

### 9.1 Add File

1. User uploads file
2. `Classify` — action = ADD_FILE
3. `Validate` — permissions, size, type
4. `Apply` — create `files` row (ACTIVE), parse, chunk, embed, extract evidence
5. `Cascade` — link evidence to entities, create new relations if needed
6. `Re-detect` — run contradiction detection
7. `Snapshot` — increment world version
8. `Log` — change_log entry
9. `Notify` — user sees "File added, N evidence items, M contradictions"

### 9.2 Add Fact

1. User types fact text
2. `Classify` — action = ADD_FACT
3. `Preview` — "This will be stored as a user claim (reliability: MEDIUM)"
4. `Confirm`
5. `Apply` — create evidence with source_type=user_claim
6. `Re-detect`, `Snapshot`, `Log`, `Notify`

### 9.3 Edit Fact

1. User clicks Edit on a user claim
2. `Preview` — show diff (old text vs new text)
3. `Confirm`
4. `Apply` — old claim → SUPERSEDED; new claim → ACTIVE
5. `Re-detect`, `Snapshot`, `Log`, `Notify`

### 9.4 Deactivate

1. User clicks Deactivate on any item
2. `Preview` — "This will hide item X. Note: contradictions Y and Z will become ACTIVE again."
3. `Confirm`
4. `Apply` — item → INACTIVE; superseded relations cascade
5. `Re-detect` — contradictions re-evaluated; resurrection possible
6. `Snapshot`, `Log`, `Notify`

### 9.5 Reactivate

1. User clicks Reactivate on an INACTIVE item
2. `Confirm` (short — non-destructive)
3. `Apply` — item → ACTIVE
4. `Re-detect`, `Snapshot`, `Log`, `Notify`

---

## 10. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | Python 3.12 + FastAPI | Fast, async, typed, great docs |
| DB | Supabase Postgres (free tier) | Free, pgvector available, RLS |
| Migrations | Alembic | Standard, versioned schema |
| Auth | JWT + bcrypt | Standard, no third-party |
| AI (primary) | Google Gemini (free) | Good multimodal |
| AI (fallback) | Groq (free) | Fast LLM |
| AI (local) | Ollama | No-API fallback |
| Graph | NetworkX + Postgres tables | No extra infra needed at FYP scale |
| Embeddings | pgvector | In-DB, no separate service |
| Frontend | React | Premium UI priority |
| File storage | Supabase Storage | Same platform as DB |
| Testing | pytest | Standard |
| Version control | Git + GitHub | Standard |

---

## 11. Phases / Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Repo setup, docs, env | ✅ Done |
| 1 | Backend foundation, auth, world CRUD, migrations | ✅ Done |
| 2 | Frontend base (React, auth flow, world list) | ⏳ Next |
| 2.5 | Add `files`, `evidence`, `change_log`, `user_claims` tables (schema only) | ⏳ Planned |
| 3 | Ingestion: parse, OCR, chunk, embed; **Add File** end-to-end | ⏳ Planned |
| 4 | Update system: Deactivate, Reactivate, Add Fact, Edit Fact, change log, history UI | ⏳ Planned |
| 5 | Q&A: retrieval + grounded answers + citations | ⏳ Planned |
| 6 | Entities, relations, timeline, contradiction detection + resurrection | ⏳ Planned |
| 7 | What-if simulation (non-persistent overlay) | ⏳ Planned |
| 8 | Snapshots, rollback, export (optional) | ⏳ Planned |
| 9+ | Premium UI polish, admin tools, deployment | ⏳ Planned |

**If time runs short, priority order for demo:** 1 → 3 → 5 → 4 → 6 → 7.

---

## 12. How to Continue (For New Developers)

### 12.1 First Day Setup

```powershell
git clone https://github.com/Arslanasif9t9/fyp-awmb
cd fyp-awmb
.\awmb setup      # venv + install
# edit .env — add DATABASE_URL (Supabase) and JWT_SECRET
.\awmb migrate    # create tables
.\awmb admin      # create admin user
.\awmb run        # start backend → http://localhost:8000/docs
```

Frontend (once Phase 2 begins):
```powershell
cd frontend
npm install
npm run dev
```

### 12.2 Where to Start Reading Code

1. `backend/app/main.py` — entry point, routers wired
2. `backend/app/models.py` — database tables
3. `backend/app/routers/auth.py` — auth flow
4. `backend/app/routers/worlds.py` — world CRUD
5. `backend/app/security.py` — JWT + bcrypt
6. `docs/HANDOFF.md` — decisions and remaining work

### 12.3 What to Build Next (Priority Order)

1. **Phase 2.5** — Add the 4 new tables via Alembic (schema only). No logic yet.
2. **Phase 2** — Frontend React app: login, world list, world detail shell
3. **Phase 3** — Ingestion pipeline: file upload → parse → chunk → embed → evidence

### 12.4 Rules You Must Follow

1. **Never hard-delete anything.** Use status flags.
2. **Never auto-apply a destructive prompt.** Classify intent, then confirm.
3. **Never check permissions via LLM.** Check via code + DB.
4. **Never full re-embed on update.** Incremental only.
5. **Every change writes a `change_log` row before returning success.**
6. **Every answer must cite evidence.** If none, say "not in stored data."
7. **User claims are never presented as verified fact.**

### 12.5 Code Style

- Python: 3.12, type hints everywhere, ruff for linting
- Functions: small, single-purpose, tested
- Errors: always user-readable (use the `@api` decorator pattern from ToolBox — see references)
- Commit messages: `feat:`, `fix:`, `docs:`, `refactor:`

---

## 13. FAQ — Viva Preparation

These are the questions examiners actually ask. Have these ready.

### Q1: "Model kahan hai? Aap ne koi ML model train nahi kiya?"
**A:** The word "model" here means **world model** — a structured internal representation of a situation (entities, relations, evidence, timeline), not a neural network. We use pretrained AI models (Gemini, Groq) as components. The "model" is the database-backed knowledge structure that grows as data arrives.

### Q2: "ChatGPT se farq kya hai?"
**A:** Three differences:
1. **State.** ChatGPT forgets each session; we build a persistent world that evolves.
2. **Contradictions.** ChatGPT hides them; we detect and show them.
3. **Evidence.** ChatGPT answers freely; we answer only from stored, cited evidence.

### Q3: "Append-only kyun? Delete kyun nahi?"
**A:** Three reasons:
1. What-if simulation needs past states — we can rewind.
2. Audit trail is a hard requirement — every change must be traceable.
3. Data loss is unrecoverable with hard delete. Append-only makes every action reversible.

### Q4: "Novelty kya hai?"
**A:** *"Versioned, contradiction-aware, append-only world construction."* No existing tool combines: multimodal ingestion + persistent memory + contradiction detection + reversible history + non-persistent what-if simulation, all in one pipeline. Each piece exists separately; the combination is novel.

### Q5: "Free AI models kaafi hain?"
**A:** Yes, for FYP scale. Gemini and Groq have generous free tiers. Ollama provides a local fallback. Ingestion is incremental (not full re-embed), so API usage stays low.

### Q6: "Scale kaise karoge?"
**A:** Postgres handles millions of rows easily. NetworkX handles thousands of nodes. If we outgrow it, we add Neo4j — but FYP scale doesn't need it.

### Q7: "What if the LLM hallucinates?"
**A:** The LLM is constrained to produce answers **only** from retrieved evidence. Our prompts include: "If the evidence doesn't contain the answer, say 'not in stored data'." We also cite every claim, so hallucination is visible and correctable.

### Q8: "How do you evaluate?"
**A:** Four metrics:
- **Groundedness:** % of answers with valid citations (target: >95%)
- **Contradiction recall:** % of seeded contradictions detected (target: >85%)
- **Usability:** SUS score from 5 users (target: >70)
- **Latency:** median Q&A response time (target: <3s)

### Q9: "Is this a research project or engineering?"
**A:** Engineering-heavy (~60% software/data, ~40% AI integration). We don't train models. Our contribution is the **system design** — how to combine ingestion, memory, reasoning, and simulation in a coherent, safe, reversible pipeline.

### Q10: "Kya ye code assistant hai?"
**A:** No. This is not Cursor or Copilot. We handle **documents**, not codebases. Code is explicitly out of scope.

---

## 14. Glossary

| Term | Meaning |
|------|---------|
| **World** | Container for one topic; holds files, evidence, entities, relations |
| **Entity** | A thing in the world (person, place, organization, concept) |
| **Relation** | A connection between two entities |
| **Evidence** | A claim extracted from a source, with metadata |
| **Contradiction** | Conflict between two pieces of evidence |
| **Timeline** | Chronological view of events in a world |
| **ACTIVE** | Item is currently valid, appears in queries |
| **INACTIVE** | Item is deactivated by user, hidden from queries |
| **SUPERSEDED** | Item replaced by a newer version |
| **FAILED** | Item failed processing |
| **Append-only** | Every change is a new record; nothing deleted |
| **Deactivate** | Soft-hide an item; reversible |
| **Reactivate** | Restore an INACTIVE item |
| **User claim** | Fact provided by user (not extracted from file); reliability MEDIUM |
| **Reliability** | HIGH (legal/signed), MEDIUM (user claim), LOW (verbal) |
| **Change log** | Record of every action in the world |
| **Snapshot** | Full world state at a point in time |
| **What-if** | Non-persistent simulation; doesn't change stored world |
| **Resurrection** | Contradictions becoming ACTIVE again after their resolving evidence is deactivated |
| **Ingestion** | Process of accepting and parsing a file |
| **Perception** | Extracting text and structure from raw input |
| **Construction** | Building entities, relations, evidence from perception |
| **Chunking** | Splitting text into retrievable pieces |
| **Embedding** | Vector representation of text for search |
| **RAG** | Retrieval-Augmented Generation — AI answers grounded in retrieved facts |
| **Grounded answer** | Answer with cited evidence, no guessing |

---

## 15. References

### Project Documents

- `README.md` — Quick overview and setup
- `docs/HANDOFF.md` — Decisions, phases, API, DB (single source of truth)
- `AI_World_Model_Builder_FYP_Proposal.pdf` — University proposal

### Related Tools (for reference, not dependencies)

- [FastAPI](https://fastapi.tiangolo.com/) — backend framework
- [Supabase](https://supabase.com/) — Postgres + auth + storage
- [pgvector](https://github.com/pgvector/pgvector) — vector search in Postgres
- [NetworkX](https://networkx.org/) — graph library
- [Gemini API](https://ai.google.dev/) — primary LLM
- [Groq](https://groq.com/) — fast LLM fallback
- [Ollama](https://ollama.com/) — local LLM fallback

### Sibling Project

- [Arslanasif9t9/toolbox](https://github.com/Arslanasif9t9/toolbox) — file manipulation tools (PDF, OCR, image, audio). Same patterns used: `@api` decorator, `Err` exception, plugin auto-discovery, job management.

---

**End of guide.** If anything is unclear, open an issue or add a note to `docs/HANDOFF.md`.