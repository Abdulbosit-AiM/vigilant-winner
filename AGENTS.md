# AGENTS.md — code-owner contract

Short contract for whoever holds the keyboard (Cursor / Claude Code CLI / human).
Companion to `CLAUDE.md`, which is the full operating contract. Read `CLAUDE.md` first.

## Goal
Ship **Maternify** — a live, working AI product for VibeHack London 2026, **Health
Impact** track, pathway **Safer Maternity Care** (locked). Two flows:
**Express** (symptom → red-flag gate → urgency → grounded English script + **TTS
playback**) and **Interpret** (paste NHS letter → plain-language explanation + next
steps + questions). Mandarin↔English for the hackathon. Demoable, usable,
technically credible, scoped to finish in 24h.

## Source of truth (precedence)
1. `docs/pathways/4-maternity.md` (the locked working spec)
2. `CLAUDE.md`
3. This file
4. `../hackathon/HACKATHON_PLAYBOOK.md` + `../hackathon/capability-router.md`

## Working rules
- Build the **smallest demoable product first** (`CLAUDE.md` §6). **Safety gate
  first** — the red-flag bypass ships before anything depends on it.
- Run the **review-before-build loop** and update `docs/SCOPE_MEMORY.md` at the end
  of every block (read its last 3 entries before starting one). `docs/BUILD-CHECKLIST.md`
  is the hour-by-hour.
- Keep **AI central** to the workflow, never decorative.
- **One code owner at a time.** Claude does not edit source while you implement.
- Apply the **smallest coherent diff**; preserve conventions.
- **Write the Zod schema before the Claude prompt** — the prompt satisfies the schema.
- Prefer **local verification over claims** — run it before saying "done".
- Treat **secrets and health data carefully**: `.env.local` is gitignored, only
  `.env.example` is committed; **never log user input** (no `console.log(userInput)`).

## Health guardrails (hard — see `docs/health/SAFETY-GUARDRAILS.md` §0)
- The **5 hardcoded rules** ship verbatim in every system prompt. Know them.
- No diagnosis. **No reassurance** ("this is fine" / "don't worry").
- **Pregnancy red-flag input bypasses the LLM** (reduced fetal movement, severe
  headache, bleeding, "胎动减少"…) → static emergency card; never reassured away.
- **Every LLM output passes Zod** — no raw model text to the client.
- Crisis path (self-harm/abuse) must also exist and fire.
- Disclaimers visible on screen; every clinical claim cites a named NHS/Tommy's source.

## Environment
- macOS / Linux + bash. See `docs/SETUP.md`. Two secrets only: `ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`. No database, no auth in the hackathon build.
- The `../hackathon/scripts/*.ps1` are Windows-only — **do not run them here.**
- Cursor agent constraints live in `.cursor/rules/` (3 always-active rules).

## Validation before demo (see `docs/judge-rubric.md` for the scored self-check)
- [ ] App starts from a **fresh terminal**.
- [ ] Express + Interpret work without agent help; **TTS plays** the English script.
- [ ] Red-flag input (EN + Mandarin) fires the emergency card and **bypasses the LLM**.
- [ ] **No raw LLM output past Zod**; every output cites a source + has the disclaimer.
- [ ] `npm run build` + `npm run lint` pass (0 TS errors).
- [ ] No secrets committed; no PII logged server-side.
- [ ] Demo script matches implemented behaviour; mocked parts labelled.

## Handoff format
- **Planner →** goal, surfaces, invariants, risks, validation.
- **Implementer →** diff, proof points, known gaps.
- **Reviewer →** severity-ordered findings, file refs, test gaps.
