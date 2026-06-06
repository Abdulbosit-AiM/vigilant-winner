# Pathway Decision — RESOLVED

> **Decision (human, 6 June 2026): Pathway 4 — Safer Maternity Care.**
> Working spec: [`4-maternity.md`](4-maternity.md) — now the top source of truth
> (`CLAUDE.md` §11). The three unchosen pathway stubs have been removed; their
> tools are dropped from `docs/TOOLS.md`.

## Why maternity won

We compared four pathways (Student Mental Health, NHS Admin, Prevention, Safer
Maternity Care) through the judging lens — Relevance + User Understanding +
Real-World Value = 65% of the score and are non-technical.

- **Strongest evidenced problem (25% Relevance):** MBRRACE-UK shows Black women
  are ~2.3–3× more likely to die in pregnancy/childbirth than White women, Asian
  women ~1.3–2×, with **no improvement** in the disparity. High-impact, emotive,
  undeniable.
- **Sharpest persona (20% User Understanding):** "under-heard mothers" maps
  directly to the criterion — a pregnant woman from an ethnic-minority background
  who feels dismissed at appointments.
- **Clear AI-central mechanic (20% Appropriate AI Use):** turn a worry into
  plain-language context + assertive questions for the midwife — advocacy, not
  diagnosis — plus red-flag escalation.
- **Plausible NHS fit (20% Real-World Value):** NHS Service Search API for real
  local maternity services; a concern/response trail a clinician could read.

## The accepted risk

This pathway carries the **highest safety bar** of the four: pregnancy red-flags
(reduced fetal movement, severe headache, bleeding) are high-stakes. We accept
this with eyes open — the escalation path must be tested, unmistakable, and never
reassured away. See `CLAUDE.md` §7 and `docs/health/SAFETY-GUARDRAILS.md`.

## Lock-in checklist (from the original brief)

1. ~~Update `CLAUDE.md` §1 (promise, user, AI capability).~~ ✅ Done.
2. ~~Promote `4-maternity.md` to the working spec.~~ ✅ Done.
3. ~~Connect only this pathway's tools (`docs/TOOLS.md`).~~ ✅ Done — Strava,
   ICD-10, NPI Registry, QRISK3 dropped.
4. Run Phase 1 (product cut) with Claude — confirm the 90s demo flow and three
   acceptance criteria in `4-maternity.md`.

## Evidence sources (maternity)

- MBRRACE-UK (Birthrights summary, 2025) — https://birthrights.org.uk/2025/09/11/no-improvement-in-maternal-death-rates-or-racial-inequalities-finds-latest-mbrrace-report/
- GOV.UK ethnic-minority maternity engagement — https://www.gov.uk/government/publications/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff
- Black Maternal Health (Parliament) — https://publications.parliament.uk/pa/cm5901/cmselect/cmhealth/895/report.html
- MBRRACE-UK (NPEU) — https://www.npeu.ox.ac.uk/mbrrace-uk
