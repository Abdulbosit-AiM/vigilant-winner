# Pathway 4 — Safer Maternity Care

> Status: **CHOSEN — WORKING SPEC** (locked 6 June 2026, human decision).
> This file is the **top source of truth** (`CLAUDE.md` §11).
> Support high-risk & under-heard mothers in accessing care.

## The problem (evidenced, UK)
- **MBRRACE-UK:** women from **Black** ethnic groups are ~**2.3–3× more likely** to
  die in pregnancy/childbirth than White women; **Asian** women ~**1.3–2×**. The
  latest report shows **no improvement** in these disparities.
- Drivers include **communication failures, discriminatory practice, and lack of
  individualised, culturally-sensitive care** — many ethnic-minority women report
  **not feeling heard** and **not trusting** services.
- This is a high-impact, well-evidenced, emotionally compelling problem — and maps
  directly to "User Understanding" (under-heard users).

## Target user (one)
A pregnant woman from an ethnic-minority background who feels dismissed at
appointments, unsure which symptoms are serious or how to make her concerns land.

## Product cut
- **Promise:** "Understand what's worth raising, how to be heard, and when to act —
  with you at every appointment."
- **Core flow:** symptom/concern intake → AI explains in plain terms + **coaches how
  to raise it** ("say this to your midwife") → **red-flag checker** that escalates
  urgent symptoms → find real local maternity services (Service Search).
- **Central AI capability:** turn a worry into clear, assertive, safe questions for
  a clinician, plus reliable red-flag escalation — advocacy, not diagnosis.

## Acceptance criteria
1. A concern returns plain-language context + concrete, assertive questions to ask
   the midwife/GP — no diagnosis.
2. A pregnancy red-flag (e.g. reduced fetal movement, severe headache, bleeding)
   **immediately** triggers urgent escalation (`docs/health/NHS-RESOURCES.md`).
3. Output points to a real local maternity service (or a labelled mock at demo time).

## Safety notes (highest safety bar of the four)
- Pregnancy red-flags are critical — the escalation path must be tested and
  unmistakable. Never reassure away a red-flag.
- Advocacy tone: empower the user's voice; never replace clinical judgement.
- Culturally-aware, multilingual, plain language. No diagnosis.

## Tools
- **NHS Service Search API** (find local maternity/specialist services).
- `design:ux-copy` (advocacy tone) + `design:accessibility-review` (multilingual,
  low-literacy, distressed users).
- Evidence via MBRRACE-UK / PubMed. See `docs/health/NHS-RESOURCES.md`.

## Differentiation ideas
"Prepare for your appointment" question-builder; symptom diary the clinician can
read; multilingual mode; a record of concerns raised vs responses, to build a
paper trail and confidence.

## Sources
- MBRRACE-UK (Birthrights summary, 2025) — https://birthrights.org.uk/2025/09/11/no-improvement-in-maternal-death-rates-or-racial-inequalities-finds-latest-mbrrace-report/
- GOV.UK ethnic-minority maternity engagement — https://www.gov.uk/government/publications/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff
- Black Maternal Health (Parliament) — https://publications.parliament.uk/pa/cm5901/cmselect/cmhealth/895/report.html
