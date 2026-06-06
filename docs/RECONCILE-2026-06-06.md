# Reconcile record — materna (PRD v0.2) → vigilant-winner

> Date: 6 June 2026. Mode: **full reconcile** (materna treated as the newer source
> of truth; vigilant-winner reconciled toward it where they diverged). Edits made
> in place. This file is the audit trail.

## Why this happened

The shared hackathon control plane has two sibling working copies on this machine:
`hackathon/` and `hackathon2/`. Diffing them showed that — outside the vendored
`tools/ECC/` library (byte-identical in both) — **hackathon2 adds exactly two new
things** over hackathon:

1. `.claude/settings.local.json` (a Claude Code permissions file), and
2. **`materna/`** — a 14-file project package (`PRD_v0.2.md`, `SAFETY.md`,
   `COMPLIANCE.md`, `SECURITY.md`, `TECH_STACK.md`, `FEATURE_MAP.md`,
   `RAG_CORPUS.md`, `SCOPE_MEMORY.md`, `DEMO_SCRIPT.md`, `BUILD_CHECKLIST.md`,
   `CURSOR_SETUP.md`, and three `.cursor/rules/*.mdc`).

`materna/` is a **parallel build of the same Safer Maternity Care hackathon
pathway** as `vigilant-winner` — but a different *product cut* and stack. The task
was to apply materna's additions to vigilant-winner where appropriate.

## The divergence (before reconcile)

| | vigilant-winner (was) | materna / Maternify (PRD v0.2) |
|---|---|---|
| Product | Advocacy coach: "how to be heard" → questions for the midwife | **Express** (symptom → English script + **TTS**) + **Interpret** (decode NHS letters) |
| Stack | Supabase (Postgres/Auth/RLS) + NHS Service Search | **In-memory RAG** (12 NHS/Tommy's pages) + OpenAI embeddings + **TTS** + **Zod** |
| Data | Concern/question history persisted | **No DB, no auth, no PII stored** server-side |
| Languages | Multilingual (general) | **Mandarin (Simplified) ↔ English** |
| Evidence lead | Racial disparity (Black women 2.3–3×) | Interpreter failure (96% need / 27% have) + disparity |
| Safety spec | Prose guardrails | **5 hardcoded rules** (verbatim system prompt) + red-flag bypass + Zod |
| Tooling | Cursor + Claude Code CLI | Cursor-centric (`.cursor/rules/`, SCOPE_MEMORY self-learning loop) |

Same DNA throughout: Health Impact track, no diagnosis, red-flag escalation,
NHS-cited sources, 24-hour live build.

## Decision

**Full reconcile** (chosen by the human): adopt materna's product cut, stack,
flows, safety spec and demo as canonical for vigilant-winner. Keep vigilant-winner's
genuinely stronger assets where materna is silent and they don't conflict —
specifically the detailed `NHS-RESOURCES.md` (real endpoints + crisis helplines) and
the broader **crisis path** (self-harm / abuse), which materna's safety spec doesn't
cover. Both evidence framings (interpreter failure *and* racial disparity) are kept.

## What changed in vigilant-winner

**Rewritten to the Maternify cut:**
- `CLAUDE.md` — §1 product (Maternify, Maya, Express/Interpret), §4 build order
  (safety gate first), §5 stack (in-memory RAG + TTS + Zod, no Supabase), §6 the two
  flows, §7 the 5 hardcoded rules + Zod + injection defence, §8 tools (no Supabase),
  §9 validation, §10 repo map.
- `docs/pathways/4-maternity.md` — now the Maternify working spec: §0 stat
  verification, in-scope/out-of-scope tables, the two flows, Maya, acceptance
  criteria. (Racial-disparity evidence retained.)
- `docs/health/SAFETY-GUARDRAILS.md` — added §0 (the 5 verbatim rules) + Appendices
  A–D (red-flag term lists EN+Mandarin, emergency card, Zod schemas, prompt-injection
  defence) + regulatory summary. Privacy section updated to the no-DB build. Crisis
  path kept.
- `README.md`, `AGENTS.md`, `docs/SETUP.md`, `docs/TOOLS.md`, `docs/judge-rubric.md` —
  product promise, stack, scaffold/env, tool table, and self-check all reconciled.
- `docs/pathways/DECISION-BRIEF.md` — appended a product-cut-update note (pathway
  decision unchanged; mechanic + stack changed).
- `docs/health/NHS-RESOURCES.md` — pointer added to the new RAG corpus.

**Ported net-new from materna (adapted; cross-references rewritten to vigilant-winner
paths and kebab-case where used):**
- `docs/RAG-CORPUS.md` (was `RAG_CORPUS.md`)
- `docs/SCOPE_MEMORY.md`
- `docs/BUILD-CHECKLIST.md` (was `BUILD_CHECKLIST.md`)
- `docs/TECH-STACK.md` (was `TECH_STACK.md`)
- `docs/DEMO-SCRIPT.md` (was `DEMO_SCRIPT.md`)
- `docs/health/COMPLIANCE.md`
- `.cursor/rules/01-project-context.mdc`, `02-review-pattern.mdc`, `03-scope-guard.mdc`
- `.env.example` (created; was referenced but absent)

**Deliberately not ported as separate files:**
- `materna/FEATURE_MAP.md` — its content is captured by the in/out-of-scope tables in
  `docs/pathways/4-maternity.md` §4.
- `materna/SECURITY.md` — folded into `SAFETY-GUARDRAILS.md` Appendix D + the privacy
  section + `COMPLIANCE.md`.
- `materna/CURSOR_SETUP.md` — folded into `docs/SETUP.md` (vigilant-winner keeps one
  setup doc); the `.cursor/rules/` themselves were ported.

## What was intentionally NOT changed
- The vendored `tools/ECC/` library (identical in hackathon and hackathon2).
- `.claude/settings.local.json` — vigilant-winner already has its own.
- The pathway choice and the racial-disparity evidence base.
- The crisis path and `NHS-RESOURCES.md` endpoint/helpline detail (stronger here).

## Follow-ups for the build team
- Re-verify every statistic in `docs/pathways/4-maternity.md` §0 before the pitch.
- Confirm the NHS content URLs in `docs/RAG-CORPUS.md` before scraping (Spring 2026
  NHS migration).
- If a persisted clinician-readable trail is wanted back in scope, that reintroduces
  a database (Postgres + RLS) and moves to the production path
  (`docs/health/COMPLIANCE.md`) — it is **out of scope** for the hackathon build.
