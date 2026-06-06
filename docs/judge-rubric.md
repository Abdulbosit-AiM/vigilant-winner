# Judge Rubric — pre-submission self-check

The **official Health Impact weights**. Score honestly out of each weight before
submitting. If a row is weak, that's where to spend the last hour.

| Weight | Criterion | Self-check question | Evidence in our build | Score |
| ---: | --- | --- | --- | ---: |
| **25%** | Health Problem Relevance | Is this a real, evidenced UK health problem? | MBRRACE-UK disparity stats cited in `docs/pathways/4-maternity.md` and in the UI | ___/25 |
| **20%** | User Understanding | Do we clearly know who hurts and why? | The under-heard pregnant persona + appointment journey, visible in UI | ___/20 |
| **20%** | Real-World Value | Could someone actually use this? NHS-plausible? | Working flow + privacy/safety story + "real vs mocked" stated | ___/20 |
| **20%** | Appropriate AI Use | Is AI central and used responsibly? | AI is the core mechanic; guardrails visible; no diagnosis | ___/20 |
| **15%** | Demo Quality | Will a judge get it in 2 minutes, live? | 90s script + seed data + handled failure states | ___/15 |
| | | | **Total** | **___/100** |

## Where the points really are
- **65% is non-technical** (Relevance + User Understanding + Real-World Value).
  A credible, evidenced, safe product beats a flashy demo that ignores the user.
- The fastest wins late in the build: tighten the persona, add one cited stat to
  the UI, make the privacy boundary visible, label what's mocked, rehearse the 90s.

## Demo risk
**Biggest failure modes:** live AI call fails on stage; red-flag escalation
misfires (or worse, fails to fire) in front of a judge.

**Mitigation:** `DEMO_SAFE_MODE=true` fallback to saved example (labelled as
mocked); red-flag path tested against known trigger inputs before demo; seed data
pre-loaded; backup screenshots in the pitch deck.

## Final gate (also see `CLAUDE.md` §9 and `docs/health/SAFETY-GUARDRAILS.md`)
- [ ] Fresh-terminal start works.
- [ ] Primary flow works without agent help.
- [ ] Pregnancy red-flag path fires; real resources shown; never reassured away.
- [ ] No diagnosis asserted; clinical claims cited.
- [ ] Disclaimers + storage notice visible; RLS on; no secrets committed.
- [ ] Demo script matches reality; mocked parts labelled.
