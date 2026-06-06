# AGENTS.md — code-owner contract

Short contract for whoever holds the keyboard (Cursor / Claude Code CLI / human).
Companion to `CLAUDE.md`, which is the full operating contract. Read `CLAUDE.md` first.

## Goal
Ship a live, working AI product for VibeHack London 2026 — **Health Impact** track,
pathway **Safer Maternity Care** (locked): worry → plain-language context +
assertive questions for the midwife + pregnancy red-flag escalation + real local
service signposting. Demoable, usable, technically credible, scoped to finish in 24h.

## Source of truth (precedence)
1. `docs/pathways/4-maternity.md` (the locked working spec)
2. `CLAUDE.md`
3. This file
4. `../hackathon/HACKATHON_PLAYBOOK.md` + `../hackathon/capability-router.md`

## Working rules
- Build the **smallest demoable product first** (the universal core, `CLAUDE.md` §6).
- Keep **AI central** to the workflow, never decorative.
- **One code owner at a time.** Claude does not edit source while you implement.
- Apply the **smallest coherent diff**; preserve conventions.
- Prefer **local verification over claims** — run it before saying "done".
- Treat **secrets and health data carefully**: `.env` is gitignored, only
  `.env.example` is committed; no PII in logs or third-party prompts.

## Health guardrails (hard — see `docs/health/SAFETY-GUARDRAILS.md`)
- No diagnosis. Advocacy / education / signposting only.
- **Pregnancy red-flag path** (reduced fetal movement, severe headache, bleeding…)
  must exist, fire on trigger input, and never be reassured away.
- Crisis path (self-harm/abuse) must also exist and fire.
- Disclaimers visible on screen.
- Clinical content traces to a cited NHS/NICE source.

## Environment
- macOS / Linux + bash. See `docs/SETUP.md`.
- The `../hackathon/scripts/*.ps1` are Windows-only — **do not run them here.**

## Validation before demo (see `docs/judge-rubric.md` for the scored self-check)
- [ ] App starts from a **fresh terminal**.
- [ ] Primary demo flow works without agent help.
- [ ] Pregnancy red-flag path fires on a known trigger (e.g. "baby is moving less").
- [ ] Build/lint/typecheck pass.
- [ ] No secrets committed; Supabase RLS on.
- [ ] Demo script matches implemented behaviour.

## Handoff format
- **Planner →** goal, surfaces, invariants, risks, validation.
- **Implementer →** diff, proof points, known gaps.
- **Reviewer →** severity-ordered findings, file refs, test gaps.
