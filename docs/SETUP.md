# Setup — macOS / Linux

This repo is built on **macOS/Linux + bash**. The control-plane PowerShell scripts
in `../hackathon/scripts/` are Windows-only and reference `C:\Users\SyedHassan\...`
— **do not run them here.** Use the steps below.

## Prerequisites
- Node.js ≥ 20 and npm (`node -v`, `npm -v`)
- Git (`git --version`)
- A **GLM API key** (Z.ai — primary generation; optional `GLM_BASE_URL`/`GLM_MODEL` overrides)
- A **Gemini API key** (fallback generation + `gemini-embedding-001` for RAG +
  **TTS** for the English-script audio + STT + OCR)
- A **Supabase project** (free tier) with the text-only `corpus` and `events`
  tables — used only for the public corpus backup and anonymous events. **No auth,
  no PII, no embeddings in the DB.** (The app degrades gracefully if absent.)
- No NHS API key — the corpus indexer scrapes public NHS/Tommy's pages at build time.

## First-time setup
```bash
# from repo root
cp .env.example .env.local          # then fill in real values (never commit .env.local)

# once the Next.js app is scaffolded in Phase 2:
npm install
npm run dev                         # http://localhost:3000
```

## Scaffolding the app (Phase 2 — pathway is locked: Safer Maternity Care / Maternify)
```bash
# Next.js 14 + TS + Tailwind, App Router
npx create-next-app@latest . --ts --tailwind --app --eslint
# AI + validation + data deps (`openai` = SDK for the OpenAI-compatible GLM endpoint)
npm install openai @supabase/supabase-js zod
```
Keep it minimal. Add libraries only when they clearly save time (`CLAUDE.md` §5).
File structure, API routes, and the latency budget are in `docs/TECH-STACK.md`.

## Fresh-terminal start (the validation standard)
A judge / teammate must be able to run, from a clean shell:
```bash
git clone https://github.com/Abdulbosit-AiM/vigilant-winner.git
cd vigilant-winner
cp .env.example .env.local   # fill values
npm install
npm run dev
```
If that doesn't produce a working primary flow, we are **not** done (`CLAUDE.md` §9).

## RAG corpus quick notes
- Index the **NHS/Tommy's sources** in `docs/RAG-CORPUS.md` at **build time** with
  `npm run index:corpus` (scrape → chunk ~400 tokens / 50 overlap → embed with
  Gemini `gemini-embedding-001` → write `data/corpus/index.json`).
- Embeddings live **only** in `data/corpus/index.json`, loaded **in memory**
  (JS array + cosine similarity) — never in Supabase. 8 of the 12 sources are live
  post-NHS-migration; 4 dead URLs are skipped (see `docs/SCOPE_MEMORY.md` Block 7).
- Every retrieval surfaces the `source_name` for inline citation. **Verify each URL
  before scraping** (the NHS is migrating some content in Spring 2026).

## Safety gate quick notes
- Build `lib/redFlags.ts` + `lib/urgencyGate.ts` (`detectRedFlag(text): boolean`)
  **first** — it runs before any LLM call and bypasses generation on a red-flag.
- Write the **Zod schemas** (`lib/schemas.ts`) before the prompts (`lib/prompts.ts`).
- See `docs/health/SAFETY-GUARDRAILS.md` for the term lists, emergency card, and schemas.

## Secrets discipline
- `.env.local` (and any `.env*` except `.env.example`) is gitignored.
- Secrets: `GLM_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL` +
  `SUPABASE_PUBLISHABLE_KEY` (or legacy `SUPABASE_ANON_KEY`) — never the
  service-role key. Plus the `DEMO_SAFE_MODE` switch.
- No secrets in client bundles, logs, prompts, or MCP config. **Never log user input.**
- See `.env.example` for the full list of required vars.
