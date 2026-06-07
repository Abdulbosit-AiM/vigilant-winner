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
Write the output Zod schema for each API route BEFORE writing the generation
prompt. The schema is the contract. The prompt is engineered to satisfy the schema.
Rationale: reverse order causes prompt rewrites when schema doesn't match.

### Decision: urgencyGate before LLM (always)
The red-flag check is a pure synchronous function. It runs before any API call.
It cannot be moved, async-ified, or made into a separate service without a review.
Rationale: latency on emergency path must be < 500ms. LLM latency is 1–8s.

### Decision: In-memory RAG only
No external vector DB (Pinecone, pgvector, Weaviate). Embeddings in JS array, cosine similarity.
Rationale: 12 sources fit in memory. External DB setup takes 1–2 hours. Not worth it for hackathon.

### Decision: TTS streaming — **SUPERSEDED (Block 5 / M4)**
~~OpenAI TTS response piped directly to client as `ReadableStream`.~~
Superseded by the v0.3 stack: **Gemini TTS returns raw PCM, server-wraps to WAV
(`lib/wav.ts`), returned as base64 in one JSON response — never a stream** —
serverless streaming is unreliable, and a pre-recorded clip in `/public/demo`
backs the Play moment. See Block 5 entry.

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

### Block 5 — Voice: TTS playback + STT (M4) · COMPLETE
Built:
- `lib/wav.ts` — `parsePcmRate(mimeType)`, `pcmBufferToWav(pcm, rate, ch, bits)`, `pcmToWav(base64Pcm, …)`. Wraps Gemini TTS RAW PCM (`audio/L16;codec=pcm;rate=24000`, s16le mono 24kHz) in a 44-byte WAV/RIFF header so a browser `<audio>` can play it. Server-side (Node Buffer).
- `lib/wav.test.ts` — 6 unit tests: RIFF/WAVE/fmt /data tags, byte length = 44 + dataLen, RIFF chunk size, PCM format fields (format=1, mono, rate, bits=16, byteRate, blockAlign), non-default rate, and `parsePcmRate` extraction/fallback.
- `app/api/tts/route.ts` (`runtime="nodejs"`) — POST `{text, voice?}` → `geminiTts` → `pcmToWav` (rate from mimeType) → JSON `{audioBase64Wav, mimeType:"audio/wav"}`. On mocked/empty → 503 `{mocked:true}` so the client falls back to the demo clip. Returns base64 (not a stream) for serverless reliability.
- `app/api/stt/route.ts` (`runtime="nodejs"`) — POST `{audioBase64, mimeType}` → `geminiTranscribe` → `{text}`; on mocked/empty (incl. 429 quota) → 503 `{error, mocked:true}`. User audio never logged.
- `lib/audioClient.ts` — browser-only: `blobToWavBase64(blob)` decodes a MediaRecorder blob (webm/opus) via `AudioContext.decodeAudioData` and re-encodes to mono s16le WAV base64 (`audioBufferToWavBase64`) with chunked btoa. Avoids server-side ffmpeg and the webm-opus-not-accepted problem.
- `components/ExpressFlow.tsx` (additive) — Play button on the english_script card: POST `/api/tts` → play `data:audio/wav;base64,…` via `Audio`; on any failure falls back to `/demo/express-script.wav` and shows an "Example audio (offline)" label. Mic control under the textarea (gated behind a `navigator.mediaDevices` + `MediaRecorder` feature check set in `useEffect`): records → client-side WAV → `/api/stt` → transcript populates the input; on failure shows "Couldn't transcribe — please type instead." M0–M3 behaviour untouched.
- `scripts/gen-demo-audio.ts` — one-off: loads `.env.local`, calls live Gemini TTS once for the demo script, writes `data/demo/express-script.wav` (canonical) + `data/demo/express-script.txt` + `public/demo/express-script.wav` (browser-served fallback).
- Demo assets: `data/demo/express-script.{wav,txt}` + `public/demo/express-script.wav` (584,250-byte WAV, 24kHz, real Gemini TTS of the 34-week reduced-movement script).
Worked: Gemini TTS is live (separate quota) — `/api/tts` curl returned HTTP 200, valid `RIFF….WAVE`, sampleRate 24000, 202,170 bytes (= 44 + 202,126 data). `pcmToWav` unit tests pin the header math. typecheck + lint clean; vitest 40/40 (was 34, +6 wav). Demo WAV generated and header-verified (RIFF/WAVE).
Struggled: (1) `<audio>` cannot play Gemini's raw PCM — must wrap in WAV first (the whole reason for `lib/wav.ts`). (2) STT shares the `gemini-2.5-flash` quota with text generation, which is exhausted today → `/api/stt` curl returned the expected graceful 503 (`mocked:true`); STT NOT proven live, but the failure path is verified and the UI degrades to "type instead". (3) Dev-server lifecycle: detached `nohup`/`&` processes die when the shell call returns and `kill` is blocked inside the sandbox; the reliable pattern is to launch `npm run dev` as a persistent background shell job (block_until_ms:0) and curl from a separate call, killing via a `["all"]`-permission shell. A stale `.next` + crashed watchpack (EMFILE) once caused new routes to 404 — `rm -rf .next` + fresh start fixed it.
Learned: for serverless audio, return base64 JSON, never a stream. Parse the sample rate from the mimeType (`rate=…`) rather than hardcoding, so a future TTS rate change still produces a correct WAV. Encode WAV on the CLIENT (decodeAudioData → s16le) to dodge webm/opus rejection without ffmpeg. Pre-record the demo clip AND serve it from `/public` so the Play moment is decoupled from any live call. Never log the transcribed text or audio (medical privacy).
Deviated: demo WAV is saved under `data/demo/` as instructed AND mirrored to `public/demo/express-script.wav` so the browser can fetch it as the Play fallback (Next only serves static files from `/public`). Added `scripts/gen-demo-audio.ts` (reproducible regeneration) — not requested but small and additive.
Risk for next block: the same `gemini-2.5-flash` daily cap blocks live STT (and Express/Interpret generation) in the demo → M6 DEMO_SAFE_MODE fixtures (`/data/demo/{redflag,express,interpret}.json`) + the offline-label discipline are still needed. The pre-recorded TTS clip and the `usedDemoAudio` "Example (offline)" label already cover the Play moment. `public/demo/express-script.wav` must be committed for the deployed fallback to work.

---

### Block 6 — Interpret Flow (M3) · COMPLETE
Built:
- `lib/schemas.ts` — added `InterpretModelSchema` (the 6 model fields: document_type, explanation_native, explanation_en, explanation_source non-empty, next_steps array 1–4, questions_en array 2–4 — all strings min(1)) + `InterpretOutputSchema` (`kind:"interpretation"` + the 6 fields + disclaimer literal = `DISCLAIMER`) + `InterpretFallbackSchema` (`kind:"fallback"`, message, disclaimer) + `InterpretResponse` union (reuses `ExpressEmergencySchema` for the red-flag payload). Validation = `safeParse`, deterministic, no second LLM call. Mirrors the M2 model-subset/final-shape split.
- `lib/prompts.ts` — `INTERPRET_SYSTEM_PROMPT` with the 5 rules VERBATIM (reuses `SAFETY_RULES`). Tells the model to determine document_type, explain only what the letter says (no inferred diagnosis), emit only the 6 fields; disclaimer added server-side. User/letter text passed only as the user turn.
- `app/api/interpret/route.ts` (`runtime="nodejs"`) — `detectRedFlag()` FIRST as a safety net → emergency payload (no model, `writeEvent` red_flag) ; else resolveLang → `retrieveContext` → `generateJson` → `InterpretModelSchema.safeParse` → assemble `InterpretOutputSchema` + disclaimer → return `{...output, source}`; validated fallback shape on any failure (never raw text). Anonymous `writeEvent({kind:"interpret", lang})`; letter text never logged.
- `components/InterpretFlow.tsx` — client flow: paste textarea, EN/中文 manual switch (matches ExpressFlow), POST `/api/interpret`; renders document_type + explanation_native + explanation_en + **numbered** `<ol>` next_steps + `<ul>` questions_en + inline source citation + disclaimer on every output; full-screen `<EmergencyCard/>` on red-flag; "not stored" line + honest "Generated by GLM/Gemini" label.
- `app/page.tsx` — converted to a client component with a minimal Express/Interpret segmented switch (defaults to Express); header/footer unchanged. Express behaviour untouched.
- Tests: `lib/schemas.test.ts` — added 9 interpret cases (valid model + output pass; empty explanation_source fails; <1 and >4 next_steps fail; <2 and >4 questions_en fail; wrong disclaimer fails; unknown fields stripped). Total suite 34 pass (was 25).
Worked: typecheck/lint/test all green (34 pass). Live smoke test: red-flag paste ("severe headache and blurry vision") returned the static emergency card in 7ms with NO model call; non-urgent GTT-result paste returned the validated `kind:"fallback"` shape (disclaimer present, no raw text) after attempting GLM→Gemini for ~4.1s. Reused M2's `generateJson` + fallback discipline verbatim — no new generation plumbing needed.
Struggled: GLM still out of balance + Gemini free-tier daily quota exhausted → live generation degrades to `source:"none"` → fallback (expected; documented in Block 4). So the SUCCESS path is proven by the unit test feeding mock JSON through `InterpretModelSchema`/`InterpretOutputSchema.safeParse`, not by a live call today. Dev server started via a detached subshell dies when the shell command returns — must launch it as a true background job to curl against it.
Learned: for a two-flow page, keep the tab/segmented state in a client `page.tsx` and let each flow own its own language switch — no shared state needed, smallest diff, Express untouched. Reuse the existing emergency Zod shape (`ExpressEmergencySchema`) for Interpret's red-flag payload rather than defining a parallel one — the route returns the identical `buildEmergencyCard()` object.
Deviated: PRD §11.3 has no `kind` discriminator; added `kind:"interpretation"` to mirror Express's `kind:"guidance"` so the client can discriminate the union (consistent in-house convention, additive). PRD .docx §11.3 extracted cleanly via `textutil` and matches SAFETY-GUARDRAILS Appendix C exactly — no content gaps.
Risk for next block: Same Gemini 20-req/day cap blocks live Interpret demos → M6 DEMO_SAFE_MODE fixtures (`/data/demo/interpret.json`) needed before the pitch. Supabase `corpus`/`events` tables still absent (readCorpus/writeEvent log a handled error, never throw) and `/data/corpus/index.json` still missing → Interpret runs with empty RAG context (rule-4 fallback citation) until the M6 indexer populates it.

---

### Block 7 — Simulator UI, fixtures, indexer, rate limit, hardening (M6) · COMPLETE
Built:
- `data/demo/{express,interpret,redflag}.json` — literal, fully-written demo-safe fixtures (PRD §11.8). express = 34-week reduced-movement guidance (urgency=today, Mandarin native, English script matching the pre-recorded TTS clip, midwife_team contact); interpret = first-trimester "1 in 85" screening explanation (zh+en, 3 next_steps, 3 questions); redflag = the literal `buildEmergencyCard()` emergency payload. No diagnosis, no reassurance, every clinical claim cites a named NHS/Tommy's source, exact disclaimer literal.
- `lib/demoFixtures.ts` — `loadExpress/Interpret/RedflagFixture()` (fs read of `data/demo/*.json`, never throws).
- `app/api/express/route.ts` + `app/api/interpret/route.ts` — wired fixture fallback: on `DEMO_SAFE_MODE=true` OR generation failure (`source:"none"` / Zod fail / assemble fail), serve the matching fixture **validated against its Output schema** (never raw) with `offline:true`. Red-flag gate stays ALWAYS real (never a fixture), runs first, before the DEMO_SAFE_MODE branch.
- `lib/rateLimit.ts` — in-memory sliding-window limiter (10 req/min/IP) + `getClientIp()` (x-forwarded-for → x-real-ip → "unknown") + `__resetRateLimit()` for tests. Applied to `/api/express`, `/api/interpret`, `/api/stt` (no `/api/ocr` yet — that's M5). Returns 429 + `Retry-After` + clear JSON.
- `components/DeviceFrame.tsx` — CSS phone shell (390×844, status bar, dynamic-island notch, rounded bezel) + fixed Simulator⇄Webview toggle persisted in `localStorage("maternify:view")`; defaults Simulator ≥768px / Webview <768px; renders plain children until mounted (avoids hydration mismatch). Wrapped the whole app via `app/layout.tsx`. Presentation-only — no API/routing change.
- `components/ExpressFlow.tsx` + `components/InterpretFlow.tsx` — `offline?:boolean` on the guidance/interpretation types; "Example (offline)" / "示例（离线）" badge on the result card; hides the "Generated by…" line when offline.
- `app/page.tsx` — bilingual tab labels ("Express 表达" / "Interpret 解读").
- `scripts/index-corpus.ts` (`npm run index:corpus`) — scrapes the NHS/Tommy's pages from docs/RAG-CORPUS.md, `<main>`-preferring HTML→text, ~400-tok chunks / ~50-tok overlap (cap 8/source), embeds via `geminiEmbed`, writes `data/corpus/index.json` `{chunk_text,vector,source_name,source_url}[]`. Quota-aware (stops embedding on first mocked result, keeps remaining as text-only). Embeddings ONLY in index.json; optional Supabase TEXT-only backup (best-effort).
- Tests: `lib/demoFixtures.test.ts` (4 — each fixture validates against its Zod schema + no-placeholder check) + `lib/rateLimit.test.ts` (5). Suite 40 → **49 passing**.
Worked: all three DEMO_SAFE_MODE scenarios verified by curl — Express (benign input) → guidance fixture `offline:true`; Interpret → interpretation fixture `offline:true`; red-flag ("severe headache and blurry vision") → REAL `kind:"emergency"` card (no fixture). Rate limiter returns 429 after the window is exceeded (curl + unit test). Browser-verified: desktop ≥768px renders the 390×844 phone frame centered (left=438 in a 1280 window) with status bar + notch; toggle flips to full-bleed Webview without reload and **persists across reload**; <768px (722px window) defaults to Webview; the Express offline card renders the "Example (offline)" badge + amber urgency chip (colour+icon ▲+text). build + lint + typecheck + 49 tests all green. **Embeddings were NOT exhausted today** — 44/44 chunks embedded with real vectors.
Struggled: 6 of 12 RAG-CORPUS URLs 404 after the Spring-2026 NHS/Tommy's migration. Recovered the two PRIMARY-corpus pages via web search — Tommy's baby movements → `/pregnancy-information/pregnancy-symptom-checker/baby-fetal-movements`; NHS screening → `/screening-for-downs-edwards-pataus-syndrome/` (slug now singular, no "and"). 4 remain dead and are SKIPPED (noted below). Indexer ended at 8/12 sources, 44 chunks. Supabase `corpus` table still absent → text backup skipped (handled, non-fatal). DEMO_SAFE_MODE override: set it as a shell env var (`DEMO_SAFE_MODE=true npm run dev`) since Next's @next/env does not override already-set process.env, so .env.local's `false` is bypassed.
Learned: validate the fixture with the Output schema at SERVE time too (belt-and-suspenders — the "no raw to client" invariant then also covers a corrupt fixture file). Put DeviceFrame at the layout level and gate render on a mounted flag to avoid hydration mismatch (view depends on localStorage + viewport, both client-only). When verifying the simulator in a headless/narrow browser, emulate ≥768px width via CDP `Emulation.setDeviceMetricsOverride` + reload (the toggle default is computed on mount from innerWidth).
Deviated: reduced fetal movement is BOTH the express demo topic (§11.8/§11.9) and a hardcoded red-flag (§4.1) — safety wins, so the literal phrase fires the emergency card; the express fixture is therefore served on any NON-red-flag/failed generative query (or DEMO_SAFE_MODE), which is exactly the §11.8 contract. redflag.json fixture is created + schema-tested per §11.8 but is never served by a route (the gate is always real). 4 RAG sources dropped as dead URLs (NHS migration), documented — not substituted with unverified pages (RAG-CORPUS "what NOT to index" forbids guessing sources).
Dead/skipped RAG URLs (NHS Spring-2026 migration; left in the script, skipped at runtime, no working replacement confirmed): Tommy's pregnancy-warning-signs; NHS blood-tests; NHS postnatal-care (/conditions/baby/support-and-services/postnatal-care/); NHS Start-for-Life getting-antenatal-care.
Risk for next block: `data/corpus/index.json` (44 real-vector chunks) and `public/demo/express-script.wav` must be committed for grounded RAG + the offline Play moment to work on Vercel (human controls commits — NOT staged by this block). M5 (OCR) is still unbuilt: when `/api/ocr` is added, apply `rateLimit` there too (BUILD-PLAN M6.5 lists it). At demo time in NON-DEMO mode, RAG query embedding shares the Gemini quota; if it's exhausted the query embeds as a mock vector and ranking degrades — DEMO_SAFE_MODE fixtures sidestep this entirely, so demo in DEMO_SAFE_MODE.

---

### Block 7b — OCR (M5) + stack-doc reconcile · COMPLETE
Built:
- **Stack-doc reconcile (own commit, 4c981db):** 16 docs/config files reconciled from the pre-build Claude/OpenAI/no-DB cut to the shipped GLM/Gemini/Supabase stack — `.env.example` (GLM_API_KEY/GEMINI_API_KEY/SUPABASE_*/DEMO_SAFE_MODE; NHS key removed), `docs/TECH-STACK.md` (full rewrite incl. quota note + measured latencies), `CLAUDE.md` §5–§8 + repo map, README, TOOLS, SETUP, AGENTS, BUILD-CHECKLIST, RAG-CORPUS, COMPLIANCE, SAFETY-GUARDRAILS §0/§5, 4-maternity (STT/OCR → in-scope bonus tier), `.cursor/rules/01+03` (stack block, file structure, TTS-base64 rule, model guidance), and the superseded TTS-streaming decision above.
- `lib/ocr.ts` — `assessOcrText(raw)`: deterministic extraction-quality gate (normalise whitespace; reject `[mock:` prefixed, empty, or <20 *meaningful* chars counted via `\p{L}\p{N}` so punctuation noise fails but CJK passes). No model call.
- `lib/gemini.ts` — `geminiOcr({imageBase64, mimeType})`: vision `generateContent` with an extract-only instruction (preserve line breaks, no commentary/translation), `thinkingBudget:0`, labelled mock fallback.
- `app/api/ocr/route.ts` (`runtime="nodejs"`) — rateLimit → validate (400 no image / 400 mime not in jpeg/png/webp/heic/heif allowlist / 413 >~8MB decoded) → `geminiOcr` → mocked→503 ("type instead"), `assessOcrText` fail→422 `unreadable:true` → else `{text}` for USER CONFIRMATION. Route never calls Interpret itself (PRD §11.7); image processed in-memory, never logged/persisted.
- `components/InterpretFlow.tsx` (additive) — 📷 "Photograph the letter" button (hidden `<input type="file" accept="image/*" capture="environment">`), client-side type/size guard, FileReader→base64, POST `/api/ocr`; success → extracted text lands in the textarea + blue "check it matches the letter" confirm notice (editing clears it); failure → amber card with the server's message + **Retake photo** + "Or type/paste instead"; "photo read once, never stored" privacy line. Bilingual EN/中文 strings. M0–M6 behaviour untouched.
- Tests: `lib/ocr.test.ts` (7 cases: realistic letter, CJK, empty, too-short, punctuation noise, mock prefix, boundary). Suite 49 → **56 passing**.
Worked: full live verification on dev server — letter-photo PNG (generated via `qlmanage -t` thumbnail of a screening-letter txt) → **HTTP 200 in 1.4s with byte-perfect extraction incl. line breaks**; extracted text → `/api/interpret` returned a live, correctly-framed interpretation (screening-not-diagnosis, 1-in-85 explained in Mandarin); red-flag text ("severe headache and blurry vision") → emergency card via the gate; 1×1 px PNG → 422 unreadable (proving Gemini vision is LIVE today — quota reset); no-image→400, bad-mime→400, rate limit →429 after window. Server log grep: **0 occurrences** of image bytes or letter content. typecheck + lint + build + 56 tests green.
Struggled: nothing material. `qlmanage -t` is a handy zero-dependency way to render text into a test PNG on macOS.
Learned: count *meaningful* characters (`\p{L}\p{N}` unicode classes) not raw length when gating OCR output — punctuation-noise pages fail, CJK letters pass with the same rule. Return 422 (user-fixable: retake) vs 503 (system: quota/offline) so the UI can phrase the fallback honestly.
Deviated: none from BUILD-PLAN M5. The "show extracted text for confirmation" requirement is implemented as: extraction always lands in the editable textarea + confirm notice, user must press "Explain this letter" themselves — confirmation is structural, not a separate modal.
Risk for next block (demo prep): `/api/ocr` shares the gemini-2.5-flash daily quota with Express/Interpret/STT — an OCR demo moment burns generation quota; in DEMO_SAFE_MODE the OCR button degrades to 503→"type instead" (no OCR fixture exists), so the demo script should use the **paste** path for Interpret unless quota is confirmed fresh. Supabase `events`/`corpus` tables still absent (handled, non-fatal). Demo assets (`data/corpus/index.json`, `public/demo/express-script.wav`) ARE committed — verified in git.

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

### Block 12 — Demo Prep · COMPLETE (agent side — human rehearsal/recording outstanding)
Built:
- `docs/DEMO-SCRIPT.md` reconciled to ACTUAL product behaviour (verified by curl against `DEMO_SAFE_MODE=true` dev server, 7 June): new **Demo configuration** section (DEMO_SAFE_MODE on, offline-badge honesty line, pre-recorded TTS clip, simulator-toggle beat, live-mode only if `/api/health` confirms quota); Scenario 1/2 expected outputs replaced with the real fixture content (incl. the actual English script text and the corrected "out of 85 women, 1 baby — 84 not" maths, was wrongly "out of 100"); Scenario 3 expected output = the real bilingual card ("Call 999 or go to A&E now", tel:999 + tel:111, maternity-triage note) + a prepared answer for "why doesn't it say pre-eclampsia" (condition-naming on the emergency path is diagnosis-adjacent); optional rehearsed-only **OCR beat** added to Scenario 2 with the quota caveat (OCR is live even in demo mode, no fixture — default to paste); stale **Whisper** Q&A answer → Gemini multimodal; layered Fallback Plan (app's built-in degradation = layer 0) + a concrete **pre-demo morning checklist** incl. the "what's real vs mocked" answer.
- `data/demo/DEMO-INPUTS.txt` — the three copy-paste inputs (no typing live).
Worked: all three demo scenarios verified end-to-end in DEMO_SAFE_MODE — S1 exact Mandarin input does NOT trip the gate ("动得很少" ≠ "胎动减少") → guidance fixture (today/midwife_team/offline:true); S2 letter → interpretation fixture (3 steps/3 questions); S3 → REAL emergency card (matched "bad headache", <10ms); `/demo/express-script.wav` serves 200 (584,250 bytes); `/api/tts` in demo mode → clean 503 `mocked:true` so the client uses the clip. build/lint/56 tests green.
Struggled: nothing — the M6 fixture discipline made this a verification pass, not a build.
Learned: write demo-script "expected outputs" by pasting what the product actually returns, then edit for brevity — aspirational expected-outputs drift (the "1 in 100" maths slip and the pre-eclampsia line survived two doc revisions unnoticed).
Deviated: none.
Risk for next block (deploy + final checks): HUMAN TODOs — pre-record the screen capture of the 3 scenarios, capture backup screenshots, rehearse 2×, assign the single demo driver, and set `DEMO_SAFE_MODE=true` in the Vercel env for the deployed URL. Supabase `events`/`corpus` tables still absent (handled, non-fatal — but creating them removes the only error line in the server log). Block 9 (Mandarin QA) and 11 (Deploy) remain.

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
