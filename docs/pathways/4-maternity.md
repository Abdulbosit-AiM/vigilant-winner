# Pathway 4 — Safer Maternity Care · **Maternify** (working spec)

> Status: **CHOSEN — WORKING SPEC** (locked 6 June 2026, human decision).
> This file is the **top source of truth** (`CLAUDE.md` §11).
> Reconciled to the **Maternify PRD v0.2** on 6 June 2026 (see
> `docs/RECONCILE-2026-06-06.md`). Product name **Maternify** is locked for pitch.

A multilingual communication tool for minority-ethnic pregnant women in the UK. It
bridges the gap between what a woman can **say** and what her clinician needs to
**hear** — without diagnosing, replacing clinicians, or acting as a professional
interpreter.

---

## 0. Stat verification (TASK 0 — do before pitch)

These statistics MUST be re-verified against primary sources before the pitch. A
wrong number in the MBRRACE-UK block collapses 25% of judging (Health Problem
Relevance).

| Claim | Source cited | Verify |
|-------|-------------|:--:|
| 96% of reviewed cases had a documented interpreter need | MBRRACE-UK Dec 2024 | ☐ |
| 27% of those had a professional interpreter | MBRRACE-UK Dec 2024 | ☐ |
| 83% of incident cases involved language failure | Frontiers in Global Women's Health 2025 | ☐ |
| 68% of migrant women with language barriers booked late | MBRRACE-UK Dec 2024 | ☐ |
| 45% of maternal deaths judged potentially preventable | MBRRACE-UK / RCOG 2025 | ☐ |
| Black women ~2.3–3× more likely to die than White women | MBRRACE-UK (Birthrights 2025) | ☐ |
| ~1 in 3 births in England & Wales to mothers born outside UK | NPEU / ONS 2024 | ☐ |

Sources to cite live: see §Sources below and `docs/health/NHS-RESOURCES.md`.

---

## 1. The problem (evidenced, UK)

Language and communication failure is a documented cause of **preventable maternal
death** in the UK. MBRRACE-UK shows systematic interpreter-provision failure across
the NHS maternity pathway, and persistent racial disparity:

- **96% of reviewed cases had a documented need for an interpreter; only 27% had a
  professional one.** This is not a translation problem — it is a communication
  failure, and it costs lives.
- **Black women are ~2.3–3× more likely** to die in pregnancy/childbirth than White
  women; **Asian women ~1.3–2×** — with **no improvement** in the disparity.
- Drivers include communication failures, discriminatory practice, and a lack of
  individualised, culturally-sensitive care — many minority-ethnic women report
  **not feeling heard** and **not trusting** services.

Existing tools fail because: **LanguageLine** is scarce and pre-booked (not ad hoc);
**Google Translate** has no clinical grounding and no urgency signal; **general LLMs
(ChatGPT)** are ungrounded, unsafe in scope, and offer no NHS navigation.

**Maternify's differentiation:** symptom → a clinically-grounded **English script
the user can play to her midwife**. Not translation. Not information. A voice.

---

## 2. Target user (one)

**Maya** — 26–38 · pregnant or postpartum · born outside the UK · living in England.
- Mother tongue: **Mandarin (Simplified)** — hackathon v1.
- English: functional in daily life, not confident in clinical settings under
  pressure.
- Core pain: leaves appointments not understanding what was said; cannot describe
  symptoms accurately in English; receives NHS letters she cannot decode.

---

## 3. Product cut

- **Promise / one-line pitch:** "ChatGPT gives information. **Maternify gives her a
  voice.**"
- **Two flows:**
  - **Express** — symptom (text, Mandarin or English) → urgency signal → plain-
    language explanation (Mandarin) with a named NHS source → an **English script**
    she can speak or **play (TTS)** to her clinician → who to contact.
  - **Interpret** — paste NHS correspondence → plain-language explanation
    (Mandarin + English) → numbered next steps → questions to ask at the next
    appointment.
- **Central AI capability:** turn a worry into a safe, bounded, clinically-grounded
  output — advocacy and communication, **never diagnosis** — with reliable
  red-flag escalation that bypasses the model entirely.

---

## 4. Scope (v0.2 — LOCKED)

### In scope (hackathon build)

| Feature | Spec |
|---------|------|
| Express flow | **Text input only** (no STT); urgency signal; English script; next-action; TTS playback |
| Interpret flow | **Text paste only** (no OCR/photo); plain-language explanation; next steps; questions to ask |
| Languages | Input: Mandarin (Simplified) + English · Output: Mandarin explanation + English script |
| TTS | Gemini TTS · English-script audio · Play button → clinician hears it directly |
| Voice / STT input (bonus) | Gemini multimodal STT · mic on Express · degrades to "type instead" |
| OCR / photo upload (bonus) | Gemini vision · letter photo → confirmed text → Interpret · image never stored |
| Urgency gate | **Hardcoded** red-flag list → emergency card (bypasses all LLM generation) |
| RAG | 12 curated NHS/Tommy's pages indexed at build time (`docs/RAG-CORPUS.md`) |
| UI | Single-page web app · mobile-first · **no login** |
| Safety | 5 hardcoded rules (`docs/health/SAFETY-GUARDRAILS.md`) · source citation on every output |

### Out of scope (hackathon)

| Feature | Status |
|---------|--------|
| Cantonese | Dropped: Mandarin only for hackathon |
| User accounts / auth | Dropped: privacy complexity |
| Real-time translation | Out of scope entirely (regulatory risk) |
| Urdu, Bengali, Arabic | v1 roadmap |
| Persistent user history | Out of scope: no PII stored in the hackathon build |

> Note (v0.3): STT and OCR moved **into scope as bonus tier** — Gemini handles both
> with safe degradation (BUILD-PLAN M4/M5); the protected demo core remains Express
> + TTS + red-flag card. On history: the hackathon build stores **no PII
> server-side** — Supabase holds only public corpus text and anonymous events; a
> clinician-readable trail returns on the production path
> (`docs/health/COMPLIANCE.md`).

---

## 5. Core flows (detail)

### Flow A — Express

```
User inputs symptom in Mandarin or English (text)
  ↓
Red-flag gate (hardcoded list, pure sync function, < 500ms)
  ├── URGENT → Emergency card (static, no LLM) + 999/111 one-tap
  └── NON-URGENT → RAG retrieval → GLM generation (Gemini fallback)
        ↓ Zod-validated output:
          1. Urgency: Immediate / Today / Next appointment
          2. Plain-language explanation (Mandarin) + NHS source name
          3. English script (to speak or play to the clinician)
          4. Contact type (Midwife / Triage / 111 / 999) + TTS play button
```

### Flow B — Interpret

```
User pastes NHS correspondence text
  ↓
Claude identifies document type → RAG → generation
  ↓ Zod-validated output:
    1. Plain-language explanation (Mandarin + English)
    2. Next steps (numbered, 1–4)
    3. Questions to ask at next appointment (English, 2–4)
```

Supported document types: screening results, scan reports, appointment letters,
blood-result summaries.

---

## 6. Acceptance criteria

1. **Express, non-urgent:** a concern returns urgency + plain-language explanation
   (Mandarin) + an English script + contact guidance — **no diagnosis**, every
   clinical claim cites a named NHS/Tommy's source, output passes Zod validation.
2. **Red-flag:** a pregnancy red-flag (reduced fetal movement, severe headache +
   visual disturbance, bleeding, …) **immediately** triggers the static emergency
   card and **bypasses the LLM** — never reassured away
   (`docs/health/SAFETY-GUARDRAILS.md`).
3. **TTS:** the English script plays as audio the user can hold up to her midwife
   (the demo moment).
4. **Interpret:** pasting an NHS letter returns a plain-language explanation + next
   steps + questions to ask.
5. Output points to a real NHS resource (or a clearly-labelled mock at demo time);
   never an invented service, number, or URL.

---

## 7. Safety notes (highest safety bar of the four)

- Pregnancy red-flags are the highest-stakes path: the escalation must be tested and
  unmistakable, and it must run **before** any model call. Never reassure away a
  red-flag.
- No diagnosis; no false reassurance ("this is fine"). Advocacy/communication tone:
  empower the user's voice; never replace clinical judgement.
- Culturally-aware, plain language, for distressed / low-literacy / non-native
  speakers. Full rules + Zod schemas + red-flag term lists:
  `docs/health/SAFETY-GUARDRAILS.md`.

---

## 8. Tools

- **Public NHS/Tommy's pages** — ground explanations and red-flag copy in official
  pregnancy content, scraped + indexed at build time (the corpus, `docs/RAG-CORPUS.md`).
- **NHS Service Search API** — find a real local maternity service for signposting
  (production path).
- **GLM-5.1 (Z.ai)** — primary generation. **Gemini** — fallback generation,
  embeddings (RAG), TTS (English-script audio), STT, OCR.
- **Supabase** — corpus text backup + anonymous events (no auth, no PII).
- `design:ux-copy` (advocacy tone, Mandarin strings) + `design:accessibility-review`
  (multilingual, low-literacy, distressed users).
- Evidence via MBRRACE-UK / PubMed. See `docs/health/NHS-RESOURCES.md`.

---

## 9. Differentiation ideas

"Prepare for your appointment" question-builder; the TTS "play it to your midwife"
moment as the signature interaction; multilingual mode (Urdu/Bengali next); a
clinician-readable trail of concerns vs responses (production path).

---

## 10. Roadmap (post-hackathon)

| Phase | Timeline | Key additions |
|-------|----------|--------------|
| v0.2 validation | Jul–Aug 2026 | User testing with 10–15 minority-ethnic women; midwife safety review |
| v1.0 beta | Q4 2026 | Urdu + Bengali; iOS/Android; Whisper STT; extended RAG; clinician trail |
| v2.0 regulated | 2027 | NHS DSPT; clinical safety case (DCB0129); NHS App integration |

---

## Sources

- MBRRACE-UK (Birthrights summary, 2025) — https://birthrights.org.uk/2025/09/11/no-improvement-in-maternal-death-rates-or-racial-inequalities-finds-latest-mbrrace-report/
- MBRRACE-UK (NPEU) — https://www.npeu.ox.ac.uk/mbrrace-uk
- GOV.UK ethnic-minority maternity engagement — https://www.gov.uk/government/publications/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff
- Black Maternal Health (Parliament) — https://publications.parliament.uk/pa/cm5901/cmselect/cmhealth/895/report.html
