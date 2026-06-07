# Maternify — Compliance Concerns
**Hackathon build · Know what applies now vs. what applies before production**

---

## Regulatory Classification

**Current position: Health Information Tool (not a medical device)**

| Question | Answer |
|----------|--------|
| Is it a medical device? | No. Maternify does not diagnose, treat, or prescribe. It bridges communication. |
| UK MDR 2002 class? | Class 0 — not regulated as a device. Same category as a health information leaflet. |
| Does it replace a clinician? | Explicitly no — stated in UI, terms, and every output. |
| Does it store health data? | Not in hackathon build. Production requires NHS DSPT assessment. |

**The line not to cross:** If outputs were used to make treatment decisions without clinician involvement, classification risk increases. The mandatory disclaimer + "always confirm with your midwife" framing keeps Maternify below that line.

---

## What Must Appear in the UI (Hackathon)

| Requirement | Where |
|-------------|-------|
| "Not medical advice" disclaimer | Every output screen (bottom, visible without scroll) |
| "Not a professional interpreter service" | App footer + any Terms link |
| Source citation for every clinical claim | Inline with explanation |
| "Always confirm with your midwife or doctor" | End of every output |

---

## GDPR / UK GDPR (Hackathon)

- No personal data collected → no consent flow required for hackathon
- No cookies beyond session → no cookie banner required
- No analytics → no consent required
- **Do not add any analytics (GA, Hotjar, etc.) without a consent banner**

---

## Production Compliance Path

| Milestone | Requirement |
|-----------|-------------|
| Public beta (v1) | NHS DSPT self-assessment; privacy notice; data processing agreements with the AI providers (Z.ai / Google) and Supabase |
| NHS partnership | Clinical Safety Case (DCB0129); DTAC assessment |
| NHS App integration | NHS login; IG toolkit submission |
| CE/UKCA marking | Only required if classification changes to Class IIa+ device |

---

## Key Principle for Judges

The Health-Track Principle explicitly requires: *"AI should support users, professionals and existing services. It must not be presented as a replacement for clinical diagnosis, treatment or professional judgement."*

Maternify satisfies this by design — not by disclaimer. The architecture (RAG-grounded, hardcoded red-flag bypass, mandatory clinician referral) makes it structurally impossible for the product to diagnose or replace, regardless of prompt manipulation.
