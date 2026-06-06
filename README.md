# vigilant-winner

Submission for **VibeHack London 2026** · Track: **Health Impact** (sponsor: Cursor).

**Safer Maternity Care** — supporting high-risk and under-heard mothers in
accessing care. Built in 24 hours, designed to be **live, usable, evidenced, and
safe**.

> *"Understand what's worth raising, how to be heard, and when to act — with you
> at every appointment."*

A pregnant user describes a worry in plain language. The AI explains it in plain
terms, coaches her on **how to raise it with her midwife** ("say this at your
appointment"), checks for **pregnancy red-flags** and escalates urgent symptoms to
real services, and points to real local NHS maternity services. **Advocacy, not
diagnosis** — MBRRACE-UK shows Black women are ~2.3–3× more likely to die in
pregnancy/childbirth than White women, driven in part by women not being heard.

## Start here
- **[`CLAUDE.md`](CLAUDE.md)** — the operating contract. Read first.
- **[`docs/pathways/4-maternity.md`](docs/pathways/4-maternity.md)** — the working spec (top source of truth).
- **[`docs/pathways/DECISION-BRIEF.md`](docs/pathways/DECISION-BRIEF.md)** — why this pathway.
- **[`docs/TOOLS.md`](docs/TOOLS.md)** — which MCPs / skills / templates to use, and when.
- **[`docs/SETUP.md`](docs/SETUP.md)** — run it locally (macOS/Linux).
- **[`docs/health/SAFETY-GUARDRAILS.md`](docs/health/SAFETY-GUARDRAILS.md)** — the non-negotiable health rules.

## Stack
Next.js + TypeScript + Tailwind · Supabase (Postgres/Auth/RLS) · Anthropic Claude API.

## Principles (the short version)
- Live, working product — not a concept pitch.
- AI is the **core mechanic**, used responsibly.
- **No diagnosis.** Advocacy, education, signposting.
- Pregnancy red-flag escalation always present — never reassured away.
- Crisis path always present. Privacy is a visible feature.
- Every health claim is cited to a real NHS / official UK source.

## Disclaimer
This project provides **support and information, not medical advice**, and is not a
substitute for a midwife, doctor, or maternity triage. **In an emergency, call 999.
For urgent pregnancy concerns, contact your maternity unit or call 111.**

---
*Repo: https://github.com/Abdulbosit-AiM/vigilant-winner*
