# Setup — macOS / Linux

This repo is built on **macOS/Linux + bash**. The control-plane PowerShell scripts
in `../hackathon/scripts/` are Windows-only and reference `C:\Users\SyedHassan\...`
— **do not run them here.** Use the steps below.

## Prerequisites
- Node.js ≥ 20 and npm (`node -v`, `npm -v`)
- Git (`git --version`)
- A Supabase account/project (free tier)
- An Anthropic API key (for the central AI capability)
- NHS developer hub subscription key (free trial) — for the **Service Search API**
  (local maternity services) and **Website Content API** (official pregnancy content)

## First-time setup
```bash
# from repo root
cp .env.example .env.local          # then fill in real values (never commit .env.local)

# once the Next.js app is scaffolded in Phase 2:
npm install
npm run dev                         # http://localhost:3000
```

## Scaffolding the app (Phase 2 — pathway is locked: Safer Maternity Care)
```bash
# Next.js + TS + Tailwind, App Router
npx create-next-app@latest . --ts --tailwind --app --eslint
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
```
Keep it minimal. Add libraries only when they clearly save time (`CLAUDE.md` §5).

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

## Supabase quick notes
- Use the **Supabase MCP** (available this session) to create tables, set **RLS
  policies**, and generate TypeScript types.
- **RLS on every table** — it's both correct and worth marks (privacy = a feature).
- Never commit service-role keys. Client uses the anon/publishable key only.

## Secrets discipline
- `.env.local` (and any `.env*` except `.env.example`) is gitignored.
- No secrets in client bundles, logs, prompts, or MCP config.
- See `.env.example` for the full list of required vars.
