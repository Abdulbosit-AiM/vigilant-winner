# Maternify — Tech Stack
**Hackathon build · Chosen for speed to ship, not long-term scale**
**Reconciled to the shipped code (BUILD-PLAN.md / PRD v0.3) on 7 June 2026.**

---

## Stack

| Layer | Hackathon choice | Why |
|-------|-----------------|-----|
| Framework | Next.js 14 (App Router) + TypeScript (strict) | Team familiarity; API routes = no separate backend |
| LLM — generation | **GLM-5.1** (Z.ai, OpenAI-compatible endpoint via the `openai` SDK) | Primary generator for Express + Interpret JSON |
| LLM — live fallback | **Gemini 2.5 Flash** (`generateContent`, `thinkingBudget: 0`, JSON mime) | When GLM is mocked/out of quota; ~1.5–3.5s |
| Embeddings | Gemini `gemini-embedding-001` | Build-time indexer → `data/corpus/index.json` |
| Vector store | In-memory (JS array + cosine similarity) | 44 chunks from 8 live NHS/Tommy's sources fit in memory; no external DB |
| TTS | Gemini `gemini-2.5-flash-preview-tts` (separate model id) | Raw PCM → server-wrapped WAV → **base64 JSON** (not a stream — serverless reliability) |
| STT | Gemini multimodal `generateContent` (audio as inline base64; client re-encodes MediaRecorder webm → WAV) | No separate ASR service |
| OCR | Gemini vision (`generateContent` with inline image) | Letter photo → text → Interpret; in-memory only, never logged/persisted |
| Data | **Supabase** — `corpus` (text-only backup) + `events` (anonymous) | **No auth, no PII, no embeddings in the DB** |
| Styling | Tailwind CSS | Fast iteration; mobile-first utilities |
| Validation | Zod (`safeParse` — deterministic, never a second LLM call) | Schema enforcement on all LLM outputs |
| Demo safety | `DEMO_SAFE_MODE` + `data/demo/*.json` fixtures | Fixtures served (Zod-validated, labelled "Example (offline)") on demo mode or any live failure |
| Rate limiting | In-memory sliding window, 10 req/min/IP | On `/api/express`, `/api/interpret`, `/api/stt`, `/api/ocr` |
| Hosting | Vercel | Zero-config Next.js deploy |

---

## API Routes

```
POST /api/express   → red-flag gate → RAG → GLM (Gemini fallback) → Zod → contact map → JSON
POST /api/interpret → red-flag gate → RAG → GLM (Gemini fallback) → Zod → JSON
POST /api/tts       → Gemini TTS → PCM→WAV wrap → { audioBase64Wav } (503 → client plays /demo/express-script.wav)
POST /api/stt       → Gemini multimodal transcribe → { text } (503 → "type instead")
POST /api/ocr       → Gemini vision extract → { text } → user confirms → Interpret
GET  /api/health    → live/mock status of GLM + Gemini
```

The red-flag gate is always real (pure synchronous function, both EN + Mandarin
lists, no model call) and runs before everything — including `DEMO_SAFE_MODE`.

---

## Environment Variables

```bash
GLM_API_KEY=                  # generation (optional: GLM_BASE_URL, GLM_MODEL)
GEMINI_API_KEY=               # fallback gen + embeddings + TTS + STT + OCR (optional model overrides)
SUPABASE_URL=                 # corpus text backup + anonymous events
SUPABASE_PUBLISHABLE_KEY=     # or legacy SUPABASE_ANON_KEY — never the service-role key
DEMO_SAFE_MODE=false
```

No auth. No PII stored. See `.env.example`.

> **Quota note (free tiers):** Gemini text has a 20-req/day free cap and GLM may be
> out of balance — the fixture fallback + pre-recorded TTS clip make the demo immune.
> Demo in `DEMO_SAFE_MODE=true`.

---

## Latency Budget

| Path | Budget | How to achieve |
|------|--------|---------------|
| Red-flag detection | < 500ms (measured: ~7ms) | Synchronous string match, no API call |
| Express (non-urgent) | < 8s | Gemini flash with `thinkingBudget: 0` (~1.5–3.5s); GLM comparable |
| Interpret | < 10s | Same pattern |
| TTS start | < 1s after text | Base64 WAV in one JSON response; pre-recorded fallback clip in `/public/demo` |

---

## Production Upgrade Path (Post-Hackathon)

| Hackathon | Production |
|-----------|-----------|
| In-memory vector store | pgvector (Supabase) / Pinecone |
| Gemini TTS | ElevenLabs British EN voice |
| Web app | React Native (iOS/Android) |
| GLM/Gemini generation | Fine-tuned safety layer + frontier model |
| Gemini multimodal STT | Whisper large-v3 |
| No auth | NHS Login or lightweight account |
| Anonymous events only | Persisted clinician-readable trail + RLS (see `docs/health/COMPLIANCE.md`) |
