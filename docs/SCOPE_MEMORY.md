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

### Block 4 — Express Flow (M2) · COMPLETE
Built:
- `lib/schemas.ts` — `ExpressModelSchema` (the subset the model returns: urgency enum, urgency_label, explanation_native, explanation_source non-empty, english_script) + `ExpressOutputSchema` (full client guidance shape incl. `kind:"guidance"`, contact_type/label, disclaimer literal = `DISCLAIMER` from emergencyCard) + `ExpressEmergencySchema` + `ExpressFallbackSchema`. Validation = `safeParse`, deterministic, no second LLM call.
- `lib/contact.ts` — `mapContact(urgency)` (PRD §11.4): immediate→maternity_triage, today/next_appointment→midwife_team, conservative-default (unknown→maternity_triage, escalate up).
- `lib/prompts.ts` — `EXPRESS_SYSTEM_PROMPT` with the 5 rules VERBATIM (`SAFETY_RULES` const). Tells model to emit only the 5 model fields; contact + disclaimer added server-side.
- `lib/rag.ts` — `retrieveContext(query)`; loads `/data/corpus/index.json` if present (cosine over Gemini embeddings), else Supabase `readCorpus()` text, else `[]`. Never throws (file absent today → empty context handled by rule-4 fallback citation).
- `lib/generate.ts` — `generateJson({system,user})` → GLM (json) primary; on mocked/parse-fail → live Gemini (`systemInstruction` separate from user, `responseMimeType:application/json`); returns `{json,source:"glm"|"gemini"|"none"}`. Reused by M3.
- `lib/gemini.ts` — added `systemInstruction` + `json` to `geminiGenerate` (top-level systemInstruction field; thinkingBudget:0 for JSON).
- `app/api/express/route.ts` (`runtime="nodejs"`) — detectRedFlag FIRST → emergency payload (no model); else RAG → generateJson → `ExpressModelSchema.safeParse` → mapContact → `ExpressOutputSchema` → return `{...output, source}`; fallback shape on any failure. Anonymous `writeEvent`; no user input logged.
- `components/ExpressFlow.tsx` + `app/page.tsx` — client flow: textarea, EN/中文 manual switch, urgency via colour+icon+text, inline source citation, disclaimer on every output, full-screen `<EmergencyCard/>` on red-flag, "not stored" privacy line, honest "Generated by GLM/Gemini" label.
- Tests: `lib/schemas.test.ts` (7) + `lib/contact.test.ts` (5). Total suite 25 pass.
Worked: red-flag bypass (EN "severe headache and blurry vision" + Mandarin "胎动减少") returns the static emergency card with NO model call. Gemini fallback returns REAL schema-valid JSON (`source:"gemini"`) — verified live multiple times. typecheck/lint/test all green.
Struggled: GLM out of balance (HTTP 429 insufficient balance) → always mocked, so Gemini is the live generator. `gemini-2.5-flash` defaults to "thinking", which (a) is slow (7–14s) and (b) occasionally returns a thoughts-only empty candidate → parse fail. Fixed with `thinkingConfig.thinkingBudget:0` (drops to ~1.5–3.5s and removes empty candidates). Then hit the Gemini **free-tier daily cap of 20 requests/day** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`) during testing → live generation now 429s and degrades to the safe fallback. Code is correct; quota is the limiter.
Learned: never retry on a 429/mocked result (it just burns quota) — only retry when `mocked===false` but JSON parse fails (the empty-candidate case). For JSON generation always set `thinkingBudget:0`. The validated `fallback` shape is itself a correct, safe outcome (no raw text, disclaimer present) and is what a judge sees if a live call fails.
Deviated: ExpressOutputSchema split into model-subset (`ExpressModelSchema`) + final shape (`ExpressOutputSchema`) so contact/disclaimer stay deterministic per PRD §11.4 (model proposes urgency only) while still validating via Zod `safeParse`. PRD .docx extracted cleanly via `textutil` — no content gaps; §11.2/§11.4/§11.6/§4 all used as written.
Risk for next block: Gemini free-tier 20-req/day cap will block live demos — M6 DEMO_SAFE_MODE fixtures (or enabling billing) are needed before the pitch. M3 (Interpret) can reuse `generateJson` + the same fallback discipline. `/data/corpus/index.json` still absent → Express currently runs with empty RAG context (rule-4 fallback citation); M6 indexer must populate it for grounded citations.

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
