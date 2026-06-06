# SCOPE_MEMORY.md — Self-Learning Phase Log
**Maternify · Hackathon Build · Updated by AI agent after each block**

This file is the agent's persistent memory. It accumulates learnings across every phase.
Read the last 3 entries before starting any new block. Apply all "Learned" rules.

---

## How to read this file

Each block entry follows this format:
```
### Block [N] — [Name] · [STATUS]
Built / Worked / Struggled / Learned / Deviated / Risk for next block
```

Status: `COMPLETE` | `IN PROGRESS` | `BLOCKED`

---

## Pre-Build Decisions Log

Record architectural decisions made before code was written.
These carry forward into every block.

### Decision: Zod-first development
Write the output Zod schema for each API route BEFORE writing the Claude prompt.
The schema is the contract. The prompt is engineered to satisfy the schema.
Rationale: reverse order causes prompt rewrites when schema doesn't match.

### Decision: urgencyGate before LLM (always)
The red-flag check is a pure synchronous function. It runs before any API call.
It cannot be moved, async-ified, or made into a separate service without a review.
Rationale: latency on emergency path must be < 500ms. LLM latency is 1–8s.

### Decision: In-memory RAG only
No external vector DB (Pinecone, pgvector, Weaviate). Embeddings in JS array, cosine similarity.
Rationale: 12 sources fit in memory. External DB setup takes 1–2 hours. Not worth it for hackathon.

### Decision: TTS streaming
OpenAI TTS response piped directly to client as `ReadableStream`. Never buffer to memory first.
Rationale: buffering adds 1–3s delay. Streaming starts playback immediately.

### Decision: Prompts in lib/prompts.ts
All system prompts are named exports in `/lib/prompts.ts`. Routes import them.
Rationale: reviewable, testable, versionable. Inline prompts are invisible to code review.

---

## Phase Log

### Block 0 — Pre-Build · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: Stats verification (6 MBRRACE-UK numbers) must complete before pitch prep begins.

---

### Block 1 — Setup · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 2 — Safety Gate (M1) · COMPLETE
Built:
- `lib/redFlags.ts` — `RED_FLAG_TERMS_EN` / `RED_FLAG_TERMS_ZH` (verbatim from SAFETY-GUARDRAILS.md Appendix A) + a `RED_FLAG_TERMS` map keyed by language for easy extension.
- `lib/urgencyGate.ts` — pure synchronous `detectRedFlag(text): { hit; term? }`; checks both language lists regardless of selected language; lowercases EN input, substring-matches ZH. No model call.
- `lib/emergencyCard.ts` — `buildEmergencyCard()` static bilingual card + exported `DISCLAIMER` literal (Appendix B).
- `components/EmergencyCard.tsx` — full-screen red card, `tel:999` / `tel:111` one-tap, bilingual body + maternity-triage note + disclaimer; presentation-only, pure props (defaults to `buildEmergencyCard()`), no network/model.
- Tests: `lib/urgencyGate.test.ts` (10 cases) + `lib/emergencyCard.test.ts` (3 cases). Added `vitest` (dev) + `"test": "vitest run"`.
Worked: vitest ran on TS with zero config; the required acceptance cases (reduced fetal movement, severe headache + blurry vision, 胎动减少, mild back pain) all behave correctly. typecheck + lint clean.
Struggled: nothing notable — Mandarin substring matching needs no normalization here because no red-flag term contains punctuation/whitespace.
Learned: keep EN red-flag terms lowercase at the source so the gate only has to lowercase the input once; check EN list (lowercased) then ZH list (raw) for an O(n) deterministic pass.
Deviated: none. PRD .docx absent; used SAFETY-GUARDRAILS.md Appendix A/B as the authority (term lists + card copy) as instructed. Card copy is drafted (headline/body/body_native EN+ZH + maternity note) consistent with Appendix B; no reassurance, ends with exact disclaimer.
Risk for next block: M2 must call `detectRedFlag()` FIRST in `app/api/express/route.ts` before any GLM call; reuse `DISCLAIMER` literal from `lib/emergencyCard.ts` (or move to shared schema constant) so the Zod `disclaimer` literal stays identical.

---

### Block 3 — RAG Pipeline · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 4 — Express Flow · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 5 — TTS Playback · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 6 — Interpret Flow · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 7 — End-of-Day-1 Check · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 8 — UI · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 9 — Mandarin QA · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 10 — End-to-End QA · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 11 — Deploy · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 12 — Demo Prep · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

### Block 13 — Final Checks · PENDING
Built: —
Worked: —
Struggled: —
Learned: —
Deviated: —
Risk for next block: —

---

## Accumulated Rules (auto-updated)

After each block, the agent appends a rule here if a new pattern emerged.
Rules here override prior assumptions. Read before starting any block.

*(empty — no blocks completed yet)*
