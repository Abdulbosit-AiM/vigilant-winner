# Maternify — Build Checklist
**Hackathon · 2-Day Build · June 2026**
**Rule: do not skip forward. Each block gates the next.**

## How to use this with Cursor

Start every block by saying to Cursor:
> "I'm starting Block [N] — [Name]. Read SCOPE_MEMORY.md last 3 entries, then run the review-pattern protocol."

End every block by saying:
> "Block [N] complete. Update SCOPE_MEMORY.md."

The agent runs: SITUATE → REVIEW → FIX → PLAN → BUILD → VERIFY → UPDATE MEMORY.
Do not skip the review step. It exists to catch issues before they compound.

---

## TASK 0 — Pre-Build (Before writing a single line of code)

- [ ] Verify every stat in `pathways/4-maternity.md` §0 against primary sources
      (the MBRRACE-UK interpreter-failure + disparity numbers)
- [ ] Lock team roles: who owns Express / who owns Interpret / who owns UI / who owns RAG
- [ ] Confirm API keys available: GLM (Z.ai, generation) · Gemini (fallback gen +
      embeddings + TTS + STT + OCR) · Supabase (corpus/events) · Vercel (deploy)
- [ ] Create `.env.local` from `.env.example` with the keys (never commit)
- [ ] Confirm the repo runs and the `.cursor/rules/` (3 rules) load in Cursor

---

## DAY 1 — Core Build

### Block 1 · Setup (Hours 0–1)

**→ REVIEW GATE:** No prior blocks. Read SETUP.md. Confirm `.cursor/rules/` is in project root. Confirm Cursor picks up all 3 rules.

- [ ] Scaffold: `npx create-next-app@latest maternify --typescript --app`
- [ ] Install deps: `openai` (SDK for the OpenAI-compatible GLM endpoint) ·
      `@supabase/supabase-js` · `zod` (Gemini is called via fetch — no SDK)
- [ ] Set up Vercel project + env vars in dashboard
- [ ] Confirm Next.js dev server runs clean

### Block 2 · Safety Gate — CRITICAL (Hours 1–2)

**→ REVIEW GATE:** Read Block 1 SCOPE_MEMORY entry. Confirm dev server runs clean. Confirm `.env.local` exists with keys. Confirm SCOPE_MEMORY Block 1 is marked COMPLETE before continuing.

**Build this before anything else. Everything else depends on it.**

- [ ] Create `lib/redFlags.ts` — hardcoded keyword/phrase list in English + Mandarin
- [ ] Create `lib/urgencyGate.ts` — pure function: `detectRedFlag(text: string): boolean`
- [ ] Create emergency card component: static content, one-tap tel: link, no LLM call
- [ ] Write unit tests for `urgencyGate`:
  - [ ] "reduced fetal movement" → true
  - [ ] "severe headache with vision changes" → true  
  - [ ] "mild back pain" → false
  - [ ] Mandarin: "胎动减少" (fetal movement reduced) → true
- [ ] All tests pass before moving to Block 3

### Block 3 · RAG Pipeline (Hours 2–4)

**→ REVIEW GATE:** Read `lib/urgencyGate.ts` and `lib/redFlags.ts`. Confirm all unit tests pass (`npm test`). Check SCOPE_MEMORY Block 2. Apply its "Risk for next block" entry now.

- [ ] Index the 12 sources from RAG-CORPUS.md (fetch + chunk + embed at build time)
- [ ] Store embeddings in-memory (no external vector DB — too slow to set up)
- [ ] Create `lib/rag.ts` → `retrieveContext(query: string): string[]`
- [ ] Test: "fetal movements" query returns Tommy's / NHS content, not hallucinated text
- [ ] Test: "Down's syndrome screening" query returns screening explainer content

### Block 4 · Express Flow (Hours 4–6)

**→ REVIEW GATE:** Read `lib/rag.ts`. Run a manual retrieval test: query "fetal movements" → confirm returns NHS/Tommy's content (not empty, not hallucinated). Check SCOPE_MEMORY Block 3 "Risk" entry. Write `ExpressOutputSchema` in Zod BEFORE writing the Claude prompt.

- [ ] Create `/api/express` route:
  1. Receive `{ symptom: string, language: 'zh' | 'en' }`
  2. Run `urgencyGate` first — if red flag → return emergency card payload (no LLM)
  3. RAG retrieval: top 3 chunks for symptom
  4. GLM call (Gemini live fallback) with strict system prompt (see health/SAFETY-GUARDRAILS.md for prompt constraints)
  5. Return structured JSON: `{ urgency, explanation_native, english_script, contact }`
- [ ] Enforce output structure with Zod schema — reject malformed model responses
- [ ] Never return raw LLM text without schema validation
- [ ] Latency check: non-urgent path < 8 seconds end-to-end

### Block 5 · TTS Playback (Hours 6–7)

**→ REVIEW GATE:** Read `/api/express/route.ts`. Confirm: (1) `urgencyGate` called first, (2) Zod schema validates output, (3) no raw LLM text reaches client. Fix any issues BEFORE adding TTS. Measure Express latency in browser network tab — must be < 8s.

- [ ] Create `/api/tts` route: receive `{ text: string }` → Gemini TTS → wrap PCM as WAV → return base64 JSON (not a stream)
- [ ] Add Play button to Express output card
- [ ] Test: English script plays clearly through browser speakers
- [ ] Test: audio starts < 1 second after generation completes
- [ ] **This is the demo moment — protect it. Do not cut.**

### Block 6 · Interpret Flow (Hours 7–9)

**→ REVIEW GATE:** Play the TTS audio in browser. Confirm audio starts < 1s after text ready. Read SCOPE_MEMORY Blocks 4 + 5. Write `InterpretOutputSchema` in Zod BEFORE writing the Interpret Claude prompt — apply the schema-first lesson from Block 4.

- [ ] Create `/api/interpret` route:
  1. Receive `{ content: string, language: 'zh' | 'en' }`
  2. Identify document type (same GLM/Gemini generation call)
  3. RAG retrieval: relevant context for document type
  4. Generate explanation + next steps + questions (GLM, Gemini fallback)
  5. Return: `{ doc_type, explanation_native, next_steps, questions_en }`
- [ ] Enforce output structure with Zod schema
- [ ] Test with: screening result letter, scan report, appointment confirmation

### Block 7 · End-of-Day-1 Check

- [ ] Express flow works end-to-end: text → urgency → script → TTS
- [ ] Interpret flow works end-to-end: paste → explanation → next steps → questions
- [ ] Red-flag path triggers emergency card (test 3 red-flag inputs)
- [ ] No raw LLM output leaking past schema validation
- [ ] Every output includes disclaimer string
- [ ] Commit: `git commit -m "feat: core flows complete, safety gate active"`

---

## DAY 2 — Polish + Demo Prep

### Block 8 · UI (Hours 0–2)

**→ REVIEW GATE:** Read SCOPE_MEMORY Block 7. Review all accumulated "Risk" entries from Blocks 1–7. Read `components/` directory — identify any component built during flow work that needs to be extracted or cleaned up before UI polish begins.

- [ ] Mobile-first layout (375px minimum width)
- [ ] Two clear entry points: Express / Interpret (no other navigation)
- [ ] Urgency signal: colour (red/amber/green) + icon + explicit text label (accessibility)
- [ ] Source citations inline below each explanation
- [ ] Emergency card: full-screen, red background, single CTA, no other content
- [ ] Disclaimer footer on every output screen
- [ ] Mandarin UI strings (labels, buttons, instructions)
- [ ] Test on mobile viewport in browser devtools

### Block 9 · Mandarin Input QA (Hours 2–3)

**→ REVIEW GATE:** Read `lib/redFlags.ts` Mandarin array. Read accumulated "Learned" rules in SCOPE_MEMORY "Accumulated Rules" section. Check if any prior block identified Mandarin edge cases (full-width punctuation, traditional vs simplified variants).

- [ ] Paste Mandarin text into Express → verify urgency gate handles Chinese characters
- [ ] Verify Claude returns Mandarin explanation and English script (not mixed)
- [ ] Test red-flag terms in Mandarin (e.g. "胎动减少", "严重头痛", "阴道出血")
- [ ] Verify Mandarin red-flag list in `redFlags.ts` is complete

### Block 10 · End-to-End QA (Hours 3–4)

**→ REVIEW GATE:** Read DEMO-SCRIPT.md scenarios 1, 2, 3. Read SCOPE_MEMORY all blocks. List all open risks across the "Risk for next block" entries. Triage: which risks affect the demo? Fix those first before running QA.

Run full demo script (see DEMO-SCRIPT.md) end-to-end:

- [ ] Demo scenario 1: Maya — reduced fetal movements (non-urgent → urgent boundary)
- [ ] Demo scenario 2: Maya — NHS screening letter (1 in 85 result)
- [ ] Demo scenario 3: Red-flag input → emergency card (staged)
- [ ] All three < target latency
- [ ] No console errors
- [ ] No hallucinated clinical claims (spot-check 3 outputs against RAG corpus)
- [ ] Safety disclaimer present on all outputs

### Block 11 · Deploy (Hours 4–5)

**→ REVIEW GATE:** Run `npm run build` locally — must pass with 0 TypeScript errors. Run `npm run lint` — must pass. Confirm all Vercel env vars match `.env.local` keys. Do NOT deploy if build fails — fix first.

- [ ] `vercel --prod`
- [ ] Test deployed URL on mobile device (not just devtools)
- [ ] Confirm env vars loaded correctly in production
- [ ] Confirm TTS audio plays on mobile browser
- [ ] Share URL with team; all test independently

### Block 12 · Demo Prep (Hours 5–6)

**→ REVIEW GATE:** Test deployed URL on a real mobile device. Confirm TTS audio plays. Confirm emergency card triggers on red-flag input. Read SCOPE_MEMORY in full — compile all "Deviated" entries into a one-paragraph "what we changed and why" for judges if asked.

- [ ] Assign demo driver (one person only — no handoffs mid-demo)
- [ ] Pre-load both demo scenarios (text ready to paste — no typing live)
- [ ] Rehearse full demo 2x including pitch narrative
- [ ] Prepare fallback: if live demo fails, have screen recording ready
- [ ] Review DEMO-SCRIPT.md pitch beats — time it (target: 3 min demo, 2 min Q&A)

### Block 13 · Final Checks

- [ ] No API keys in source code
- [ ] No PII logged server-side
- [ ] Rate limiting on `/api/express` and `/api/interpret` (simple in-memory, prevents abuse)
- [ ] 404 returns for any unexpected routes (no stack traces exposed)
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `npm run lint` passes

---

## Scope Creep Rules

**If someone suggests adding a feature mid-build, apply this test:**
1. Is it in pathways/4-maternity.md §3 In Scope? → Yes = allowed. No = rejected.
2. Does it protect the demo moment (TTS playback)? → If yes, discuss. If no, reject.
3. Does it touch the safety gate? → Only the assigned safety owner touches that code.

**Never cut:**
- Red-flag emergency card
- TTS playback (the demo moment)
- Source citations
- Disclaimer string

**Cut immediately if running behind:**
- Interpret flow (Express alone is a complete demo)
- Mandarin UI strings (English-only UI still demonstrates the concept)
- Questions-to-ask section of Interpret output
