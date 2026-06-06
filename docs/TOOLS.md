# Tools, MCPs, Skills & Templates — Safer Maternity Care

Curated and grounded for **vigilant-winner**, tailored to the **locked pathway:
Safer Maternity Care** (`docs/pathways/4-maternity.md`). The principle from the
control plane holds: **load a tool only when its phase needs it.** Tools for the
unchosen pathways have been removed (see §D).

Legend: ✅ available in this session · 🔌 connect via MCP registry when needed ·
🧩 skill (invoke when its phase starts).

---

## A. MUST-HAVE — build/ship spine

| Tool | Type | Why it's must-have | Phase |
| --- | --- | --- | --- |
| **Anthropic Claude API** | external (app code) | The central AI capability: Sonnet for Express generation, Haiku for RAG summarisation. Worry → grounded English script + urgency; letter → explanation. Wrap with a mock fallback for demo safety. | 3–6 |
| **OpenAI API** | external (app code) | Two jobs: `text-embedding-3-small` for the **in-memory RAG** index, and **TTS** for the English-script audio (**the demo moment**). | 3–5 |
| **Zod** | lib | Schema-validate **every** LLM output — no raw model text to the client. The structural half of the safety story. Write the schema before the prompt. | 3–6 |
| **NHS Website Content API** | REST (app code) | Official NHS.uk pregnancy content — the source for the **12-page RAG corpus** (`docs/RAG-CORPUS.md`) and red-flag copy. *Not an MCP.* | 3–4 |
| **NHS Service Search API** | REST (app code) | Find a **real local maternity service** for signposting. Free, needs subscription key. *Not an MCP.* See `docs/health/NHS-RESOURCES.md`. | 4 |
| **GitHub** ✅ | MCP | Repo is remote-backed (`Abdulbosit-AiM/vigilant-winner`). Issues, PRs, CI context, version safety during a fast build. | 0–6 |
| **Web search** ✅ | core | Ground every health claim with NHS / NICE / MBRRACE-UK data. 65% of the score is non-technical and evidence-driven. | 1, 5 |
| **`deep-research`** 🧩 | skill | One pass to nail the evidence base: MBRRACE-UK interpreter-failure + disparity stats, pregnancy red-flag guidance (NICE/RCOG via NHS framing). | 1 |
| **`docx` / `pptx` / `pdf`** 🧩 | skill | Submission material: one-page product narrative, pitch, demo backup deck. | 6 |

> **No Supabase / no database this build.** The earlier cut used Postgres + RLS for
> a concern/question-history trail; under the v0.2 reconcile the hackathon build
> stores **no PII server-side** (privacy = "we keep nothing"). A clinician-readable
> trail with per-user isolation (Postgres + RLS) returns on the production path
> (`docs/health/COMPLIANCE.md`).

**Verification/quality (impl owner, during hardening):** the ECC control plane
exposes `/plan`, `/tdd`, `/code-review`, `/verify`, `/e2e`, `/build-fix` (see
`../hackathon/capability-router.md`). Reach for `/security-scan` + a privacy pass
before demo — mandatory for a health product. The **red-flag escalation path gets
its own test pass** — it is the highest-stakes flow in this product.

---

## B. STRONGLY RECOMMENDED — design, demo polish, evidence

These move the high-weight non-technical criteria, and matter doubly here:
our user is often distressed, possibly multilingual, and historically **not
heard** — tone and accessibility are the differentiators.

| Tool | Type | Why | Phase |
| --- | --- | --- | --- |
| **`design:ux-copy`** 🧩 | skill | The **English-script** voice (what Maya plays to her midwife), the disclaimer string, and red-flag emergency copy that is calm and unmistakable. Plain language + **Mandarin UI strings** for low-literacy / non-native speakers. | 4–5 |
| **`design:accessibility-review`** 🧩 | skill | WCAG pass. Vulnerable, distressed, multilingual users — accessibility is explicitly a judging strength. Urgency must read via colour **and** icon **and** text. | 5 |
| **`design:user-research`** 🧩 | skill | Sharpen the single persona (**Maya** — under-heard, Mandarin-first) + her appointment journey = the 20% "User Understanding". | 1 |
| **PubMed** 🔌 | MCP | Cite peer-reviewed evidence behind the disparity framing and red-flag logic. Cheap credibility for "Real-World Value" + "Appropriate AI Use". | 1, 4 |
| **Figma** ✅ | MCP | Quick UI mockups / design-to-code for a clean, trustworthy interface. Trust is visual in health — especially for users who already distrust services. | 1, 4 |
| **Canva** ✅ | MCP | Fast pitch/submission graphics if we want polish beyond pptx. | 6 |

---

## C. REMOVED — tools for the unchosen pathways

Dropped with the pathway decision (6 June 2026). **Do not connect these.**

- **Strava** 🔌 — was for Prevention (activity data). Gone.
- **QRISK®3 / Heart Age** — was for Prevention (CVD risk). Gone.
- **ICD-10 Codes** 🔌 — was for NHS Admin letter explanations; US-centric anyway. Gone.
- **NPI Registry** 🔌 — US provider IDs, never applicable to the NHS. Gone.
- **bioRxiv / medRxiv** 🔌 — preprints, not peer-reviewed; PubMed covers our
  evidence needs. Gone.
- **`docx`/`pdf` letter parsing (file upload / OCR)** — was the NHS Admin core
  mechanic. The skills stay (for submission material). Note: the **Interpret** flow
  *does* decode NHS letters, but from **pasted text only** — no file upload or OCR
  in the hackathon build (`docs/pathways/4-maternity.md` §4 out-of-scope).
- **Hugging Face** ✅ — no specialised open model needed for this build; Claude
  covers the AI layer. Leave disconnected unless a concrete need appears.

---

## D. EXPLICITLY DEPRIORITISED for a 24h health build

- Large autonomous agent loops without a stop condition.
- Installing every community extension / >10 active MCPs.
- Heavy data-warehouse MCPs (Snowflake/BigQuery/Databricks) — no warehouse here.
- Anything that sends real PII to a third party without an explicit, visible boundary.

---

## E. The existing control-plane assets (reuse, don't rebuild)

Sitting in `../hackathon/` next to this repo:
- `templates/` — `demo-script.md`, `judge-rubric.md`, `pitch-brief.md`,
  `spec-kit-constitution.md`, `project-CLAUDE.md`, `project-AGENTS.md`.
- `capability-router.md` — when to use each agent/skill/MCP/command.
- `mcp-policy.md` + `mcp/mcp-activation-matrix.md` — lean activation rules.
- `tools/ECC/` — the full ECC capability library (skills, commands, hooks, rules).

We've copied the health-relevant pieces (rubric, demo script, constitution ideas)
into this repo so it's self-contained, and adapted them for macOS/Linux.

> ⚠️ The control-plane **scripts are PowerShell/Windows** (`doctor.ps1`,
> `init-project.ps1`, …) and reference `C:\Users\SyedHassan\.hackathon`. They do
> **not** run on this Mac. Use `docs/SETUP.md` for the bash flow.
