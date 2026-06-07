# CLAUDE.md — vigilant-winner

Foundational operating contract for this repo. Read this first. Every agent and
contributor works against this file. Keep it accurate; if reality drifts, fix
this file in the same change.

> **Event:** VibeHack London 2026 (UCL) · 24-hour AI hackathon · GBP 10,000 prize pool
> **Our track:** **Health Impact** (sponsor: Cursor)
> **Submission deadline:** 12:00 PM, 7 June 2026
> **Hard rule:** Ship a *live, working* AI product a judge can try in two minutes. No concept-only pitch.

---

## 1. What we are building

**Track goal:** Build an AI-supported product that tackles a real health challenge in the UK.

**Pathway: LOCKED — Safer Maternity Care** (chosen 6 June 2026; decision record in
`docs/pathways/DECISION-BRIEF.md`). Working spec: **`docs/pathways/4-maternity.md`**
— that file is now the top source of truth (Section 11). The product is **Maternify**
(name locked for pitch).

**Maternify** is a multilingual communication tool for minority-ethnic pregnant
women in the UK. It bridges the gap between what a woman can *say* and what her
clinician needs to *hear* — without diagnosing, replacing clinicians, or acting as
a professional interpreter. The evidence is stark: **MBRRACE-UK found 96% of
reviewed cases had a documented need for an interpreter, and only 27% had a
professional one** — language and communication failure is a documented cause of
preventable maternal death. The same data shows Black women are ~2.3–3× more likely
to die in pregnancy/childbirth than White women, with no improvement in the
disparity. (Stats to re-verify before pitch — `docs/pathways/4-maternity.md` §0.)

**Product promise / one-line pitch:** "ChatGPT gives information. **Maternify gives
her a voice.**"
**Target user (one):** **Maya** — 26–38, pregnant or postpartum, born outside the
UK, living in England. Mother tongue Mandarin (Simplified) for the hackathon build;
functional everyday English but not confident in clinical settings under pressure.
She leaves appointments not understanding what was said, receives NHS letters she
cannot decode, and can't describe symptoms accurately in English when something
feels wrong.
**Central AI capability (two flows):**
- **Express** — symptom → urgency signal → a clinically-grounded **English script
  she can speak or *play* to her midwife** (TTS) → who to contact.
- **Interpret** — paste an NHS letter → plain-language explanation + next steps +
  questions to ask.

Not translation. Not information. **A voice. Advocacy and communication, never
diagnosis.**

---

## 2. How we are judged — optimise for this, in order

The official Health Impact rubric and weights. Every decision should move one of these.

| Weight | Criterion | What it means for us | Where we earn it |
| ---: | --- | --- | --- |
| **25%** | Health Problem Relevance | Real UK health pain, evidenced with NHS/ONS data | Problem framing backed by cited stats (`docs/pathways/`) |
| **20%** | User Understanding | We clearly know who hurts and why | One sharp persona + real user-journey, visible in the UI |
| **20%** | Real-World Value | Someone could actually use this; plausible NHS fit | Working flow + clear "what's real vs mocked" + safety/privacy story |
| **20%** | Appropriate AI Use | AI is central, used responsibly, not decorative | The AI moment is the core mechanic; guardrails are visible |
| **15%** | Demo Quality | Judge gets it in 2 minutes, live | 90s demo script + seed data + handled failure states |

**Implication:** Relevance + User Understanding + Real-World Value = 65% and are
**non-technical**. A credible, well-evidenced, safe product beats a clever demo
that ignores the user. Spend research time on the problem, not just the code.

Self-check before submission: `docs/judge-rubric.md`.

---

## 3. Roles — who owns what

This repo follows the global hackathon control plane (`../hackathon/`), adapted
to this codebase. Two agents, clear lanes, one code owner at a time.

- **Cursor / Claude Code CLI (or whoever holds the keyboard) — Implementation owner.**
  Our code agents run in Cursor and via Claude Code on the CLI/terminal inside
  Cursor. Code edits, tests, build/lint fixes, Playwright checks, local scripts,
  final diff. Applies the *smallest coherent diff*. Runs verification before
  claiming done.

- **Claude — Critique & communication owner.**
  Product framing, spec critique, UX/journey critique, architecture challenge,
  demo script, submission text, **and the health-safety review**. Claude edits
  docs and Spec Kit artifacts freely; Claude does **not** edit source while the
  implementer is mid-change. Reviews report *findings first*, then recommendations.

- **Human — Decision owner.** Picks the pathway, approves external writes,
  approves anything touching real personal data.

> If two agents would touch the same file, stop and hand off. One code owner at a time.

---

## 4. Build loop — 24-hour phases

Condensed from `../hackathon/HACKATHON_PLAYBOOK.md`. The hour-by-hour, block-gated
version is `docs/BUILD-CHECKLIST.md` — and **every build block runs the
review-before-build loop and updates `docs/SCOPE_MEMORY.md`** (read its last 3
entries before starting a block). Load a capability only when its phase starts.

| Phase | Time | Owner | Output |
| --- | --- | --- | --- |
| 0 Setup | 30m | Human + impl | Repo runs, stack confirmed, **pathway chosen**, stats verified (§0 of spec) |
| 1 Product cut | 60m | Claude | Promise, persona (Maya), 2 flows, acceptance criteria, AI capability |
| 2 Technical plan | 45m | Impl | Stack, Zod schemas, RAG index plan, deploy path, risk list |
| 3 Build sprint 1 | 4h | Impl | **Safety gate first** (red-flag bypass + tests), then RAG, then Express end-to-end (AI may be mocked) |
| 4 Build sprint 2 | 6h | Impl | TTS playback, Interpret flow, Mandarin QA, urgency UI |
| 5 Hardening | 4h | Impl + Claude | Build/lint pass, **security & privacy review**, Zod-leak check, fresh-terminal start |
| 6 Demo | 2h | Claude + impl | 90s script, pre-loaded inputs, backup recording, failure states handled |

**Hard rule:** Any feature that cannot improve the live demo waits. Build order is
non-negotiable: **the red-flag safety gate ships before anything else depends on it.**

---

## 5. Tech stack (decided)

Chosen for speed-to-ship, not long-term scale. Full spec: `docs/TECH-STACK.md`.

- **Frontend/app:** Next.js 14 (App Router) + TypeScript (strict) + Tailwind.
  Single-page, mobile-first, **no login**. API routes = no separate backend.
- **AI — generation:** **GLM-5.1** (Z.ai, OpenAI-compatible endpoint) as the primary
  generator; **Gemini 2.5 Flash** as the live fallback (`lib/generate.ts`). Every
  call degrades to a saved, labelled fixture if credentials/network/quota fail
  mid-demo (Section 7, mocking rule; `DEMO_SAFE_MODE`).
- **RAG:** Gemini `gemini-embedding-001` over the curated **NHS/Tommy's corpus**
  (`docs/RAG-CORPUS.md`), indexed at build time (`npm run index:corpus`) into
  `data/corpus/index.json`, loaded as an **in-memory vector store** (JS array +
  cosine similarity — no external vector DB).
- **TTS:** Gemini TTS (`gemini-2.5-flash-preview-tts`, a separate model id) — the
  English script as audio so the clinician can hear it directly. Raw PCM is
  server-wrapped into WAV and returned as **base64 JSON** (not a stream).
  **This is the demo moment** — a pre-recorded clip in `/public/demo` backs it.
- **STT (bonus, shipped M4):** Gemini multimodal `generateContent` — voice input
  feeds Express. **OCR (bonus, M5):** Gemini vision — letter photo feeds Interpret.
- **Validation:** **Zod** `safeParse` on every LLM output — no raw model text ever
  reaches the client (`docs/health/SAFETY-GUARDRAILS.md`).
- **Data: Supabase, but no auth and no PII.** Holds only the public corpus text
  (backup) and **anonymous** events; embeddings never go in the DB; never the
  service-role key in client code. (Production path → pgvector + NHS Login; see
  `docs/TECH-STACK.md`.)
- **Deploy:** Vercel (zero-config Next.js).
- **Environment:** macOS / Linux. The `../hackathon/scripts/*.ps1` helpers are
  **Windows/PowerShell only** — do not run them here. Use the bash equivalents in
  `docs/SETUP.md` / `scripts/` instead.

Secrets: `GLM_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL` +
`SUPABASE_PUBLISHABLE_KEY` (or legacy `SUPABASE_ANON_KEY`); plus the
`DEMO_SAFE_MODE` switch. Keep dependencies minimal. Add a library only when it
clearly saves time.

---

## 6. Core spine — the two flows the product is built on

Specialised for Safer Maternity Care (`docs/pathways/4-maternity.md` has the
in-scope table + acceptance criteria; `docs/health/SAFETY-GUARDRAILS.md` has the
hardcoded rules). Build these two flows and **nothing else** for the hackathon.

**Flow A — Express** (symptom → English script + TTS):
1. User inputs a symptom in Mandarin or English — typed, or spoken via the mic
   (Gemini STT, bonus tier; degrades to "type instead").
2. **Red-flag gate runs first** — a pure synchronous function over a hardcoded
   keyword list (EN + Mandarin). On a red-flag it **bypasses all LLM generation**
   and shows the static emergency card (999 / 111, one-tap call). < 500ms.
3. Non-urgent → RAG retrieval (top chunks) → GLM generation (Gemini fallback) → a **Zod-validated**
   structured output: urgency level (Immediate / Today / Next appointment) +
   plain-language explanation (Mandarin) with a named NHS source + an **English
   script** + contact type.
4. **TTS** plays the English script aloud — she can hold the phone up to her midwife.

**Flow B — Interpret** (NHS letter → plain language):
1. User pastes NHS correspondence text, or photographs the letter (Gemini OCR,
   bonus tier; extracted text is shown for confirmation, unreadable photos fall
   back to "type/paste instead"; the image is never logged or persisted).
2. The model identifies the document type, grounds it in RAG, and returns: a
   plain-language explanation (Mandarin + English) + numbered next steps +
   questions to ask at the next appointment.

Cross-cutting, on every output: a **named NHS/Tommy's source citation**, the
mandatory disclaimer string, and **Zod validation** (no raw LLM text to the
client). Trusted signposting only — never invent a service, number, or URL
(`docs/health/NHS-RESOURCES.md`).

If Express (text → red-flag gate → urgency → English script → TTS) works
end-to-end, we have a demoable product. Interpret is the second flow; Express alone
is a complete demo if we run short.

---

## 7. Health-impact guardrails — NON-NEGOTIABLE

This track rewards trust and safety. Breaking these loses the 20% "Appropriate AI
Use" and 20% "Real-World Value" outright. Full detail, the verbatim system-prompt
block, the red-flag term lists, and the Zod schemas are in
`docs/health/SAFETY-GUARDRAILS.md`.

**The 5 hardcoded rules** (every generation system prompt — GLM or Gemini —
includes these verbatim; do not paraphrase):

1. **Never produce a diagnostic conclusion.** May describe what a symptom *may*
   indicate and recommend a clinical action; may not state what the user has.
2. **Never reassure.** No "this is fine", "don't worry", "you're probably okay".
   When symptoms look benign: "Your midwife will be able to reassure you after a
   check."
3. **Red-flag input bypasses all LLM generation.** Detection runs *before* the
   model. The emergency card is static content, no generation.
4. **Every clinical claim cites its NHS/Tommy's source by name** in the output —
   citation field never empty. If it can't be grounded: "I couldn't find specific
   NHS guidance on this — please ask your midwife directly."
5. **Every output ends with the exact string:** *"This is not medical advice.
   Always confirm with your midwife or doctor."* — a separate field, shown
   prominently, not removable.

Structural enforcement (safety by architecture, not by disclaimer):

- **Red-flag gate first, always.** Reduced fetal movement, severe headache/visual
  disturbance, bleeding, suspected pre-eclampsia, waters breaking early, chest
  pain → static emergency card (999 / maternity triage / 111). **Never reassure
  away a red-flag** — the exact failure mode MBRRACE-UK documents. Tested and
  unmistakable before demo.
- **Zod on every LLM output.** If the model's response fails validation, return a
  safe fallback — **never raw model text** to the client.
- **Prompt-injection defence.** System prompt is hardcoded server-side; user input
  is passed as a `role: 'user'` turn only, never interpolated into the system
  prompt string. `dangerouslySetInnerHTML` is banned.
- **Crisis path always present.** Self-harm, suicide, abuse, acute risk → break the
  flow, show real UK crisis resources (999, NHS 111, Samaritans 116 123); do not
  "reflectively listen" in a way that amplifies harm.
- **Visible disclaimers** (rule 5), on-screen, not buried.
- **Privacy is a feature.** No PII stored server-side in the hackathon build. Never
  log user input server-side — even in dev (medical context is sensitive). No
  `console.log(userInput)` anywhere. No PII to third parties without a clear
  boundary.
- **Mocking is honest.** If a call is mocked for the demo, the demo *says so*.
- **Vulnerable users.** Assume distressed, low-literacy, or non-native English
  speakers. Plain language. Large targets. No dark patterns.

When in doubt on a health-safety call, escalate to the human. Do not ship the
guess. **These five rules are the answer to any safety question a judge asks — know
them.**

---

## 8. MCP & tool policy — lean, task-triggered

Do not optimise for the most tools loaded. Optimise for the fewest active
resources that unblock the current phase. Full rationale: `../hackathon/mcp-policy.md`.
Curated, grounded recommendations for THIS project: **`docs/TOOLS.md`** (read it).

**Default active set:** editor + GitHub MCP (repo is remote-backed) + Supabase MCP
(corpus text backup + anonymous events — no auth, no PII, no embeddings in the DB)
+ web search for research. Everything else off until its phase.

**Health-relevant MCPs for this pathway** (connect only when needed — see
`docs/TOOLS.md`):
- **PubMed** — evidence to back clinical claims (MBRRACE-UK framing, red-flag logic).

The RAG corpus is scraped from **public NHS/Tommy's pages** at build time (no NHS
API key — see `docs/RAG-CORPUS.md` and `scripts/index-corpus.ts`). **GLM (Z.ai)**
and **Gemini** (generation fallback, embeddings, TTS, STT, OCR) are REST
dependencies called from app code, not MCPs. Tools for the unchosen pathways
(Strava, ICD-10, NPI Registry, QRISK3) are **dropped** — do not connect them.

**Build MCPs we actually use:** GitHub (version safety), Supabase (corpus/events
tables), Figma (UI mockups), Canva (pitch graphics, Phase 6 only). Cloudflare and
Hugging Face are available in-session but **not needed** for this build — leave them idle.
Skills: `deep-research` (Phase 1 evidence), `design:user-research`,
`design:ux-copy`, `design:accessibility-review`, `docx`/`pptx`/`pdf` for
submission material.

**Rules:** ≤10 active MCP servers. Prefer read-only external tools until the human
approves writes. Never put secrets in prompts or MCP config. Disable research MCPs
once the research phase ends.

---

## 9. Validation standard — before we claim "done" or demo

From `../hackathon/AGENTS.md`, plus our health additions.

- [ ] App runs from a **fresh terminal** (documented in `docs/SETUP.md`).
- [ ] Both flows work **without agent help**: Express (text → urgency → English
      script → TTS) and Interpret (paste → explanation → next steps → questions).
- [ ] **Pregnancy red-flag path fires** on a known trigger input (e.g. "baby is
      moving less" / "胎动减少") and **bypasses the LLM** to the static emergency
      card — never reassured away.
- [ ] **No raw LLM output leaks past Zod validation** (test a malformed response).
- [ ] Every output carries a named NHS/Tommy's citation + the disclaimer string.
- [ ] **TTS plays** the English script clearly (the demo moment).
- [ ] No secrets committed (`.env.local` gitignored; `.env.example` only).
- [ ] No PII logged server-side; no user input in `console.log`.
- [ ] `npm run build` + `npm run lint` pass with 0 TypeScript errors.
- [ ] Error states are not embarrassing; mocked calls are labelled.
- [ ] Demo script matches actual product behaviour.

---

## 10. Repo map

```
vigilant-winner/
├─ CLAUDE.md                      ← you are here (the contract)
├─ README.md                      ← public submission readme
├─ AGENTS.md                      ← short agent contract for code owners
├─ BUILD-PLAN.md                  ← ordered milestones M0–M6 (the executable PRD)
├─ .env.example                   ← required env vars (never commit real .env.local)
├─ .cursor/rules/                 ← always-active Cursor agent constraints (3 rules)
├─ docs/
│  ├─ SETUP.md                    ← macOS/Linux setup + fresh-terminal start
│  ├─ TOOLS.md                    ← grounded MCP/skill/template recommendations
│  ├─ TECH-STACK.md               ← stack, API routes, latency budget, prod path
│  ├─ BUILD-CHECKLIST.md          ← block-by-block 2-day build (review-gated)
│  ├─ SCOPE_MEMORY.md             ← agent's self-learning log (read before each block)
│  ├─ RAG-CORPUS.md               ← the 12 NHS/Tommy's sources to index
│  ├─ DEMO-SCRIPT.md              ← pitch narrative + 3 live scenarios + Q&A
│  ├─ judge-rubric.md             ← pre-submission self-check (with weights)
│  ├─ RECONCILE-2026-06-06.md     ← record of the materna→vigilant-winner reconcile
│  ├─ pathways/
│  │  ├─ DECISION-BRIEF.md        ← decision record: why Safer Maternity Care
│  │  └─ 4-maternity.md           ← THE working spec (top source of truth)
│  └─ health/
│     ├─ SAFETY-GUARDRAILS.md     ← 5 hardcoded rules, red-flag lists, Zod schemas
│     ├─ COMPLIANCE.md            ← regulatory position (Class 0) + GDPR + prod path
│     └─ NHS-RESOURCES.md         ← real, cited NHS/UK endpoints & helplines
├─ app/                           ← Next.js App Router (page + /api routes)
├─ components/                    ← ExpressFlow, InterpretFlow, EmergencyCard, DeviceFrame
├─ lib/                           ← gate, schemas, prompts, clients, rag, rateLimit (+ tests)
├─ data/                          ← corpus/index.json + demo fixtures/audio
└─ scripts/                       ← index-corpus.ts, gen-demo-audio.ts
```

## 11. Sources of truth (precedence order)

1. `docs/pathways/4-maternity.md` (the locked pathway spec).
2. This `CLAUDE.md`.
3. `AGENTS.md` (code-owner contract).
4. `../hackathon/HACKATHON_PLAYBOOK.md` and `../hackathon/capability-router.md`
   (global control plane).

If these conflict, the higher item wins. Fix the lower one.
