# Setup — macOS / Linux

This repo is built on **macOS/Linux + bash**. The control-plane PowerShell scripts
in `../hackathon/scripts/` are Windows-only and reference `C:\Users\SyedHassan\...`
— **do not run them here.** Use the steps below.

## Prerequisites
- Node.js ≥ 20 and npm (`node -v`, `npm -v`)
- Git (`git --version`)
- An **Anthropic API key** (Claude Sonnet/Haiku — generation)
- An **OpenAI API key** (`text-embedding-3-small` for RAG + TTS for the English-script audio)
- NHS developer hub subscription key (free trial) — for the **Website Content API**
  (official pregnancy content for the RAG corpus) and **Service Search API**
  (local maternity services for signposting)

No database and no auth in the hackathon build (in-memory RAG, no login) — so no
Supabase project is required.

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
# AI + validation deps (no database client)
npm install @anthropic-ai/sdk openai zod
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
- Index the **12 NHS/Tommy's sources** in `docs/RAG-CORPUS.md` at **build time**
  (fetch → chunk ~400 tokens / 50 overlap → embed with `text-embedding-3-small`).
- Store embeddings **in memory** (JS array + cosine similarity) — no external vector
  DB to provision; the corpus fits in memory.
- Every retrieval surfaces the `source_name` for inline citation. **Verify each URL
  before scraping** (the NHS is migrating some content in Spring 2026).

## Safety gate quick notes
- Build `lib/redFlags.ts` + `lib/urgencyGate.ts` (`detectRedFlag(text): boolean`)
  **first** — it runs before any LLM call and bypasses generation on a red-flag.
- Write the **Zod schemas** (`lib/schemas.ts`) before the prompts (`lib/prompts.ts`).
- See `docs/health/SAFETY-GUARDRAILS.md` for the term lists, emergency card, and schemas.

## Secrets discipline
- `.env.local` (and any `.env*` except `.env.example`) is gitignored.
- Two secrets only: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.
- No secrets in client bundles, logs, prompts, or MCP config. **Never log user input.**
- See `.env.example` for the full list of required vars.
