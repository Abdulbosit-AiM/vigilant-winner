# BUILD-PLAN.md — Maternify (v0.3) execution plan for Claude Code

> **Read first:** `Maternify_PRD_v0.3.docx` (the authoritative spec). This plan is the
> ordered, executable version of that PRD. §-references point at PRD sections.
> **Product:** Maternify — Express + Interpret, Mandarin↔English, on a phone-simulator web UI.
> **Stack:** Next.js 14 (App Router, TS strict, Tailwind) · GLM-5.1 (generation, RAG-summary, validation) ·
> Google Gemini (TTS, STT, OCR, embeddings) · Supabase (corpus + events, **no auth**) · Vercel.

---

## 0. Operating rules (apply to every step)

- **Safety gate ships before any generative code.** Do M1 before M2. Non-negotiable (PRD §0).
- **Write the schema before the prompt.** `lib/schemas.ts` exists before `lib/prompts.ts` (PRD §11.2–11.3).
- **No raw model text reaches the client.** Every model response is validated; on failure return a safe fallback (PRD §8, §11.2).
- **Never log user input or uploaded images** server-side. No `console.log(userInput)`. No secrets in source.
- **One milestone at a time.** Each ends green only when its acceptance check passes; commit per milestone (`feat(mN): …`).
- **Protect the demo core:** Express + TTS + red-flag card **inside the simulator**. STT, OCR, Interpret are bonus if time runs short (PRD §11.9).
- If a `SCOPE_MEMORY.md` / `.cursor/rules/` exist in the repo, follow the review-before-build loop and update memory after each milestone.

### Definition of done (whole build)
Both flows work from a fresh `npm run dev`; red-flag input (EN + Mandarin) bypasses the LLM to the static card; every output is validated, cites a source, and ends with the disclaimer; TTS plays; the app renders inside a phone simulator with a Simulator⇄Webview toggle; `npm run build` and `npm run lint` pass with 0 TS errors.

---

## Prerequisites (must exist before M0 — supplied by the production engineer)
These block the build. See the PRD §7 and the handover note. **Do not start M0 until present:**
- `.env.local` populated: `GLM_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DEMO_SAFE_MODE=false`. (No NHS key — removed; the indexer scrapes public NHS pages.)
- **Confirmed** GLM-5.1 model ID + base URL (OpenAI-compatible endpoint preferred), and the Gemini model IDs for: text/vision (`generateContent`), embeddings, and **TTS** (TTS is a *separate* Gemini model from the text model — confirm it exists on your account/region).
- Supabase project created with a **text-only `corpus` table** (id, source_name, source_url, topic, chunk_text — **no embedding column**) and an `events` table; anon key in hand.
- Repo cloned, Node ≥ 20.

If a key is missing at start, build against **mock clients** (DEMO_SAFE_MODE behaviour) and wire the live key later — do not block.

---

## M0 — Scaffold + clients  (target ~1h)
**Build**
1. `npx create-next-app@latest . --ts --tailwind --app --eslint` (single-page shell, mobile-first).
2. `lib/glm.ts` — typed GLM client; reads `GLM_API_KEY`; OpenAI-compatible call to the confirmed base URL/model; **mock-fallback** path used when `DEMO_SAFE_MODE=true` or no key.
3. `lib/gemini.ts` — typed Gemini wrappers: text/vision + embeddings + **STT via multimodal `generateContent`** (audio as inline base64, not an ASR endpoint) + **TTS** (separate model id). Each with a mock-fallback.
4. `lib/db.ts` — Supabase client from `SUPABASE_URL` + `SUPABASE_ANON_KEY`; `readCorpus()` (text only), `writeEvent()`. Embeddings are NOT in the DB. Never use the service-role key in client code.
5. `lib/env.ts` — validate required env vars at boot; fail loud with a clear message if missing.

**Acceptance**
- `npm run dev` boots clean; a `/api/health` route returns a test GLM completion and a test Gemini TTS clip (or labelled mock if `DEMO_SAFE_MODE`).
- App loads with no console errors.

**Commit:** `chore(m0): scaffold + GLM/Gemini/Supabase clients`

---

## M1 — Safety gate  (BUILD BEFORE ANYTHING GENERATIVE) (target ~1h)
**Build**
1. `lib/redFlags.ts` — hardcoded EN + Mandarin term arrays (PRD §4.1). Include the listed triggers; structure for easy extension.
2. `lib/urgencyGate.ts` — `detectRedFlag(text: string): { hit: boolean; term?: string }`. Pure, synchronous, **no model call**. Checks **both** language lists regardless of selected language (PRD §11.6).
3. `lib/emergencyCard.ts` — builds the static `EmergencyCard` object (PRD §11.5). *Draft the copy* (headline/body/body_native, EN + Mandarin) to satisfy §4 + §11.5 rules; no model text, no reassurance.
4. `components/EmergencyCard.tsx` — full-screen, red, one-tap `tel:999` + `tel:111`. Bilingual body. Disclaimer = exact literal (rule 5).

**Acceptance (unit tests, must pass before M2)**
- `"reduced fetal movement"` → hit; `"severe headache and blurry vision"` → hit; Mandarin `"胎动减少"` → hit; benign `"mild back pain"` → no hit.
- Rendering the card requires no network and no model call.

**Commit:** `feat(m1): deterministic red-flag gate + emergency card`

---

## M2 — Express (text)  (target ~2–3h)
**Build (schema → prompt → route → UI)**
1. `lib/schemas.ts` — `ExpressOutputSchema` as a **Zod** schema exactly per PRD §11.2 (urgency enum; `explanation_source` non-empty; `english_script`; `contact_type`; `disclaimer` literal). Add the red-flag and fallback shapes. **"Output validation" = `schema.safeParse(modelJson)` — deterministic, NOT a second LLM call.**
2. `lib/contact.ts` — the urgency→contact mapping (PRD §11.4), with the **conservative-default (escalate up)** rule.
3. `lib/prompts.ts` — `EXPRESS_SYSTEM_PROMPT` embedding the **5 rules verbatim** (PRD §4). User input passed as a `user` turn only — never interpolated into the system string.
4. `lib/rag.ts` — `retrieveContext(query)` over the **in-memory** index (PRD §11 note). Load precomputed embeddings from `/data/corpus/index.json` (built in M6 indexer); each chunk carries `source_name`.
5. `app/api/express/route.ts` — **`urgencyGate()` first**; red-flag → emergency payload (no model); else RAG → GLM → **validate** → map contact → return. On validation failure return the fallback shape (never raw text). Write an anonymous `event` (urgency, lang) via `lib/db.ts`.
6. `components/ExpressFlow.tsx` — input (text), language switch (EN/中文, manual overrides auto — PRD §11.6); render urgency via **colour + icon + text**; inline source citation; disclaimer on every output.

**Acceptance** (PRD §8 Express + Safety gate)
- Red-flag input → card, no model call. Non-urgent → full validated payload ending with the disclaimer, no diagnosis, no reassurance, source cited.

**Commit:** `feat(m2): express flow (gate → rag → glm → validated output)`

---

## M3 — Interpret (text)  (target ~1.5h)
**Build**
1. `InterpretOutputSchema` (PRD §11.3): `document_type`, `explanation_native`, `explanation_en`, `explanation_source` non-empty, `next_steps` (1–4), `questions_en` (2–4), disclaimer literal.
2. `lib/prompts.ts` — `INTERPRET_SYSTEM_PROMPT` (5 rules verbatim).
3. `app/api/interpret/route.ts` — document-type detect → RAG → GLM → validate → return; fallback on failure.
4. `components/InterpretFlow.tsx` — paste box; render explanation + numbered next steps + questions; citation + disclaimer.

**Acceptance** (PRD §8 Interpret): pasted screening letter → explanation + 1–4 steps + 2–4 questions, each clinical claim cited.

**Commit:** `feat(m3): interpret flow`

---

## M4 — Voice in + audio out (Gemini)  (target ~2h) — **TTS is the demo moment**
**Build**
1. `app/api/tts/route.ts` — Gemini TTS on the English script → return audio. **Return a base64/blob, not a stream** (serverless reliability); keep latency low.
2. `app/api/stt/route.ts` — STT via a Gemini **multimodal `generateContent`** call: send the audio as **inline base64 data** with a "transcribe this, return text only" instruction (NOT a Whisper-style ASR endpoint). → text → feeds Express.
3. UI: a **Play** button on every English-script card; a microphone control on Express input. **MediaRecorder typically outputs `audio/webm;codecs=opus`** — confirm Gemini accepts it; if not, transcode/repackage to WAV server-side before the call. Add this conversion step now, don't assume the raw blob works.
4. Pre-record the demo English-script audio as a static file in `/data/demo` so the Play moment never depends on a live call (PRD §11.8).

**Acceptance** (PRD §8 TTS/STT): tap Play → audio within ~1s of text ready; spoken Mandarin → transcript feeds Express.

**Commit:** `feat(m4): gemini tts playback + stt voice input`

---

## M5 — OCR (Gemini vision)  (target ~1.5h)
**Build**
1. `app/api/ocr/route.ts` — Gemini vision on an uploaded letter photo → extracted text → Interpret. Process in-memory; **never log or persist the image**.
2. **OCR-failure behaviour** (PRD §11.7): low/empty extraction → don't run Interpret; show "couldn't read" + **Retake** and **Type/paste instead** actions. Partial text → show extracted text for user confirmation before interpreting.
3. UI: photo-upload control on Interpret.

**Acceptance** (PRD §8 OCR): a letter photo → text extracted → Interpret runs; image never logged; unreadable image → safe fallback UI.

**Commit:** `feat(m5): gemini ocr + safe failure fallback`

---

## M6 — Simulator UI, polish, seed, guard  (target ~2–3h)
**Build**
1. **Mobile-app simulator** (PRD §11.1) — `components/DeviceFrame.tsx`: CSS phone shell (~390×844, status bar, notch) wrapping the app; **Simulator⇄Webview toggle** (persist in `localStorage`); default Simulator on desktop ≥768px, Webview (full-bleed) on real phones; presentation-only (must not change behaviour/routing/API).
2. **Corpus indexer** — a build-time script that scrapes the 12 public NHS/Tommy's pages (PRD §11 / repo `docs/RAG-CORPUS.md` if present; **no API key needed**), chunks (~400 tok), embeds via Gemini, and writes `/data/corpus/index.json` (chunk text + vector + source_name). `lib/rag.ts` loads that file into memory. **Embeddings live ONLY in index.json — never written to Supabase.** Optionally also upsert the chunk *text* into the Supabase `corpus` table as a readable backup (no vectors).
3. **Demo-safe fixtures** (PRD §11.8) — `/data/demo/{redflag,express,interpret}.json` with **literal, fully-written** content (real explanation, English script, steps/questions) mirroring the response schemas; on `DEMO_SAFE_MODE=true` or any live-call failure, serve the fixture and show an "Example (offline)" label. Do not leave placeholders.
4. Accessible urgency display (colour + icon + text), Mandarin UI strings, mobile layout ≥375px.
5. **Rate limiter** (in-memory, 10 req/min/IP) on `/api/express`, `/api/interpret`, `/api/stt`, `/api/ocr`.
6. **Security pass:** no key in source; user input never in the system prompt; React-escaped output only (no `dangerouslySetInnerHTML`); no user input / image logging.

**Acceptance** (PRD §8 + §11.1.1 + §11.9)
- App renders inside the phone frame on desktop; toggle switches to full-bleed Webview and persists; real-phone viewport defaults to Webview.
- `DEMO_SAFE_MODE=true` → labelled fixtures shown for all three demo scenarios.
- `npm run build` + `npm run lint` pass, 0 TS errors.

**Commit:** `feat(m6): simulator shell, demo fixtures, rate limit, hardening`

---

## Final verification (before calling it done)
Run the **judge demo flow** end-to-end (PRD §11.9) inside the simulator:
1. Express non-urgent (Mandarin reduced-movement) → urgency + English script → **Play (TTS)**.
2. Interpret (screening letter) → explanation + questions.
3. Red-flag ("severe headache and blurry vision") → instant emergency card, no AI.
4. Toggle Simulator⇄Webview.
Confirm: no diagnosis, no reassurance, every claim cited, disclaimer everywhere, no raw model text, no secrets committed, no PII logged.

---

## Build-order quick map
`M0 scaffold+clients → M1 SAFETY GATE → M2 Express → M3 Interpret → M4 TTS/STT → M5 OCR → M6 simulator+polish+seed`
Protected demo core if short on time: **M0 → M1 → M2 → M4(TTS) → M6(simulator+fixtures)**. Interpret/STT/OCR are bonus.
