# Judge Rubric — pre-submission self-check

The **official Health Impact weights**. Score honestly out of each weight before
submitting. If a row is weak, that's where to spend the last hour.

| Weight | Criterion | Self-check question | Evidence in our build | Score |
| ---: | --- | --- | --- | ---: |
| **25%** | Health Problem Relevance | Is this a real, evidenced UK health problem? | MBRRACE-UK interpreter-failure (96% need / 27% have) + disparity stats, cited in `docs/pathways/4-maternity.md` and in the UI | ___/25 |
| **20%** | User Understanding | Do we clearly know who hurts and why? | Maya — born outside UK, Mandarin-first, under-heard at appointments — + her journey, visible in UI | ___/20 |
| **20%** | Real-World Value | Could someone actually use this? NHS-plausible? | Two working flows + grounded English script she plays to her midwife + privacy story (nothing stored) + "real vs mocked" stated | ___/20 |
| **20%** | Appropriate AI Use | Is AI central and used responsibly? | AI is the core mechanic; **5 hardcoded rules + red-flag bypass + Zod** visible; no diagnosis | ___/20 |
| **15%** | Demo Quality | Will a judge get it in 2 minutes, live? | 90s script + pre-loaded inputs + **TTS moment** + handled failure states | ___/15 |
| | | | **Total** | **___/100** |

## Where the points really are
- **65% is non-technical** (Relevance + User Understanding + Real-World Value).
  A credible, evidenced, safe product beats a flashy demo that ignores the user.
- The fastest wins late in the build: tighten the persona, add one cited stat to
  the UI, make the privacy boundary visible, label what's mocked, rehearse the 90s.

## Demo risk
**Biggest failure modes:** live AI call fails on stage; red-flag escalation
misfires (or worse, fails to fire) in front of a judge; **TTS audio doesn't play**
(the signature moment).

**Mitigation:** `DEMO_SAFE_MODE=true` fallback to a saved example (labelled as
mocked); red-flag path tested against known EN + Mandarin trigger inputs before
demo; **inputs pre-loaded (no live typing)**; **pre-recorded TTS audio** as backup —
never skip the TTS moment; backup screenshots in the pitch deck. Full walkthrough:
`docs/DEMO-SCRIPT.md`.

## The signature demo moment
**Express → TTS playback:** Maya types a worry in Mandarin; the judge hears a clear,
confident **English script** the system generated for her to play to her midwife.
"ChatGPT gives information. Maternify gives her a voice." Protect this — do not cut it.

## Final gate (also see `CLAUDE.md` §9 and `docs/health/SAFETY-GUARDRAILS.md`)
- [ ] Fresh-terminal start works.
- [ ] Express + Interpret work without agent help; **TTS plays** the English script.
- [ ] Pregnancy red-flag (EN + Mandarin) fires, **bypasses the LLM**, shows the
      emergency card; never reassured away.
- [ ] No diagnosis asserted; **no reassurance** ("this is fine"); clinical claims cited.
- [ ] **Every output passes Zod** — no raw LLM text to the client.
- [ ] Disclaimers + "not stored" notice visible; no secrets committed; no PII logged.
- [ ] Demo script matches reality; mocked parts labelled.
