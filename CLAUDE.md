# CLAUDE.md — vigilant-winner

Foundational operating contract for this repo. Read this first. Every agent and
contributor works against this file. Keep it accurate; if reality drifts, fix
this file in the same change.

> **Event:** VibeHack London 2026 (UCL) · 24-hour AI hackathon · GBP 10,000 prize pool
> **Our track:** **Health Impact** (sponsor: Cursor)
> **Submission deadline:** 12:00 PM, 7 June 2026
> **Hard rule:** Ship a *live, working* AI product a judge can try in two minutes. No concept-only pitch.

---

## 1. What we are building

**Track goal:** Build an AI-supported product that tackles a real health challenge in the UK.

**Pathway: LOCKED — Safer Maternity Care** (chosen 6 June 2026; decision record in
`docs/pathways/DECISION-BRIEF.md`). Working spec: **`docs/pathways/4-maternity.md`**
— that file is now the top source of truth (Section 11).

Support high-risk & under-heard mothers in accessing care. MBRRACE-UK shows Black
women are ~2.3–3× more likely to die in pregnancy/childbirth than White women, with
no improvement in the disparity — driven by communication failures and women not
feeling heard.

**Product promise:** "Understand what's worth raising, how to be heard, and when to
act — with you at every appointment."
**Target user (one):** A pregnant woman from an ethnic-minority background who feels
dismissed at appointments, unsure which symptoms are serious or how to make her
concerns land.
**Central AI capability (one):** Turn a worry into plain-language context plus
clear, assertive, safe questions for her midwife/GP — with reliable pregnancy
red-flag escalation. **Advocacy, not diagnosis.**

---

## 2. How we are judged — optimise for this, in order

The official Health Impact rubric and weights. Every decision should move one of these.

| Weight | Criterion | What it means for us | Where we earn it |
| ---: | --- | --- | --- |
| **25%** | Health Problem Relevance | Real UK health pain, evidenced with NHS/ONS data | Problem framing backed by cited stats (`docs/pathways/`) |
| **20%** | User Understanding | We clearly know who hurts and why | One sharp persona + real user-journey, visible in the UI |
| **20%** | Real-World Value | Someone could actually use this; plausible NHS fit | Working flow + clear "what's real vs mocked" + safety/privacy story |
| **20%** | Appropriate AI Use | AI is central, used responsibly, not decorative | The AI moment is the core mechanic; guardrails are visible |
| **15%** | Demo Quality | Judge gets it in 2 minutes, live | 90s demo script + seed data + handled failure states |

**Implication:** Relevance + User Understanding + Real-World Value = 65% and are
**non-technical**. A credible, well-evidenced, safe product beats a clever demo
that ignores the user. Spend research time on the problem, not just the code.

Self-check before submission: `docs/judge-rubric.md`.

---

## 3. Roles — who owns what

This repo follows the global hackathon control plane (`../hackathon/`), adapted
to this codebase. Two agents, clear lanes, one code owner at a time.

- **Cursor / Claude Code CLI (or whoever holds the keyboard) — Implementation owner.**
  Our code agents run in Cursor and via Claude Code on the CLI/terminal inside
  Cursor. Code edits, tests, build/lint fixes, Playwright checks, local scripts,
  final diff. Applies the *smallest coherent diff*. Runs verification before
  claiming done.

- **Claude — Critique & communication owner.**
  Product framing, spec critique, UX/journey critique, architecture challenge,
  demo script, submission text, **and the health-safety review**. Claude edits
  docs and Spec Kit artifacts freely; Claude does **not** edit source while the
  implementer is mid-change. Reviews report *findings first*, then recommendations.

- **Human — Decision owner.** Picks the pathway, approves external writes,
  approves anything touching real personal data.

> If two agents would touch the same file, stop and hand off. One code owner at a time.

---

## 4. Build loop — 24-hour phases

Condensed from `../hackathon/HACKATHON_PLAYBOOK.md`. Load a capability only when
its phase starts.

| Phase | Time | Owner | Output |
| --- | --- | --- | --- |
| 0 Setup | 30m | Human + impl | Repo runs, stack confirmed, **pathway chosen** |
| 1 Product cut | 60m | Claude | Promise, 1 user, 1 demo flow, 3 acceptance criteria, 1 AI capability |
| 2 Technical plan | 45m | Impl | Stack, data shape, AI provider, deploy path, risk list |
| 3 Build sprint 1 | 4h | Impl | Thinnest end-to-end path works locally (AI may be mocked) |
| 4 Build sprint 2 | 6h | Impl | Differentiation: UX, personalisation, history, a confidence signal |
| 5 Hardening | 4h | Impl + Claude | Build/lint pass, smoke test, **security & privacy review**, fresh-terminal start |
| 6 Demo | 2h | Claude + impl | 90s script, seed data, backup screenshots, failure states handled |

**Hard rule:** Any feature that cannot improve the live demo waits.

---

## 5. Tech stack (decided)

- **Frontend/app:** Next.js (App Router) + TypeScript + Tailwind.
- **Backend/data/auth:** Supabase (Postgres + Auth + RLS). MCP available — see Section 8.
- **AI:** Anthropic Claude API as primary. Wrap every call so it can fall back to a
  saved example if credentials/network fail mid-demo (Section 7, mocking rule).
- **Deploy:** Vercel (frontend) or Cloudflare Workers if we go edge. Pick in Phase 2.
- **Environment:** macOS / Linux. The `../hackathon/scripts/*.ps1` helpers are
  **Windows/PowerShell only** — do not run them here. Use the bash equivalents in
  `docs/SETUP.md` / `scripts/` instead.

Keep dependencies minimal. Add a library only when it clearly saves time.

---

## 6. Core spine — the maternity product is built on this

The universal spine, now specialised for Safer Maternity Care
(`docs/pathways/4-maternity.md` has the acceptance criteria).

1. **Conversational intake** — a chat or guided form where a pregnant user
   describes a worry or symptom in plain language.
2. **AI reasoning layer** — a well-prompted Claude call that interprets the concern
   and produces a structured, safe, *bounded* response: plain-language context +
   concrete, assertive questions to ask the midwife/GP ("say this at your
   appointment"). Always returns a confidence or uncertainty signal. Never a
   diagnosis.
3. **Trusted signposting** — every output points to a real, cited NHS / official UK
   resource, including local maternity services (NHS Service Search API). Never
   invent a service, phone number, or URL. See `docs/health/NHS-RESOURCES.md`.
4. **Safety layer** — pregnancy red-flag detection (reduced fetal movement, severe
   headache, bleeding, etc.) that escalates to urgent real services and
   short-circuits the normal flow. See `docs/health/SAFETY-GUARDRAILS.md`.
5. **Privacy-by-default** — minimal data capture, clear "what we store" copy,
   Supabase RLS on every table, no PII in logs or prompts to third parties.
6. **History / continuity** — a record of concerns raised and questions asked, so a
   return user (or her midwife) sees the trail across appointments. This is where
   "real-world value" becomes visible.

If intake → AI advocacy coaching → signposting → red-flag escalation work
end-to-end, we have a demoable product.

---

## 7. Health-impact guardrails — NON-NEGOTIABLE

This track rewards trust and safety. Breaking these loses the 20% "Appropriate AI
Use" and 20% "Real-World Value" outright. Full detail in
`docs/health/SAFETY-GUARDRAILS.md`. The rules:

- **No diagnosis.** Frame everything as *support, triage, education, organisation,
  or signposting*. Never state or imply a diagnosis or a treatment decision.
- **No invented medical facts.** Clinical content must trace to a cited NHS / NICE /
  official source. If the model isn't sure, it says so and signposts.
- **Crisis path always present.** Any sign of self-harm, suicide, abuse, or acute
  risk → break the normal flow, show real UK crisis resources (999, NHS 111,
  Samaritans 116 123), do not "reflectively listen" in a way that amplifies harm.
- **Pregnancy red-flags are the highest-stakes path in this product.** Reduced
  fetal movement, severe headache/visual disturbance, bleeding, severe abdominal
  pain, waters breaking early → immediate urgent escalation (999 / maternity
  triage / 111). **Never reassure away a red-flag.** This path must be tested and
  unmistakable before demo.
- **Visible disclaimers.** "This is not medical advice / not a substitute for a
  clinician / in an emergency call 999." On-screen, not buried.
- **Privacy is a feature, show it.** Minimal capture, explicit storage notice,
  no PII sent to third-party AI without a clear boundary, RLS on every table.
- **Mocking is honest.** If a call is mocked for the demo, the demo *says so*.
- **Vulnerable users.** Assume some users are distressed, low-literacy, or
  non-native English speakers. Plain language. Large targets. No dark patterns.

When in doubt on a health-safety call, escalate to the human. Do not ship the
guess.

---

## 8. MCP & tool policy — lean, task-triggered

Do not optimise for the most tools loaded. Optimise for the fewest active
resources that unblock the current phase. Full rationale: `../hackathon/mcp-policy.md`.
Curated, grounded recommendations for THIS project: **`docs/TOOLS.md`** (read it).

**Default active set:** editor + Supabase MCP (once the project exists) + GitHub
MCP (repo is remote-backed) + web search for research. Everything else off until
its phase.

**Health-relevant MCPs for this pathway** (connect only when needed — see
`docs/TOOLS.md`):
- **PubMed** — evidence to back clinical claims (MBRRACE-UK framing, red-flag logic).

The **NHS Service Search API** and **NHS Website Content API** are REST APIs called
from app code (not MCPs) — see `docs/health/NHS-RESOURCES.md`. Tools for the
unchosen pathways (Strava, ICD-10, NPI Registry, QRISK3) are **dropped** — do not
connect them.

**Build/data MCPs we actually use:** Supabase (data/RLS), GitHub, Figma (UI
mockups), Canva (pitch graphics, Phase 6 only). Cloudflare and Hugging Face are
available in-session but **not needed** for this build — leave them idle.
Skills: `deep-research` (Phase 1 evidence), `design:user-research`,
`design:ux-copy`, `design:accessibility-review`, `docx`/`pptx`/`pdf` for
submission material.

**Rules:** ≤10 active MCP servers. Prefer read-only external tools until the human
approves writes. Never put secrets in prompts or MCP config. Disable research MCPs
once the research phase ends.

---

## 9. Validation standard — before we claim "done" or demo

From `../hackathon/AGENTS.md`, plus our health additions.

- [ ] App runs from a **fresh terminal** (documented in `docs/SETUP.md`).
- [ ] Core user flow works **without agent help**.
- [ ] At least one acceptance path is tested or manually verified.
- [ ] **Pregnancy red-flag path fires** on a known trigger input (e.g. "baby is
      moving less") — and is never reassured away.
- [ ] Disclaimers visible on screen.
- [ ] Supabase RLS on; no secrets committed (`.env` gitignored; `.env.example` only).
- [ ] No PII in logs or third-party prompts.
- [ ] Error states are not embarrassing.
- [ ] Demo script matches actual product behaviour.

---

## 10. Repo map

```
vigilant-winner/
├─ CLAUDE.md                      ← you are here (the contract)
├─ README.md                      ← public submission readme
├─ AGENTS.md                      ← short agent contract for code owners
├─ .env.example                   ← required env vars (never commit real .env)
├─ docs/
│  ├─ SETUP.md                    ← macOS/Linux setup + fresh-terminal start
│  ├─ TOOLS.md                    ← grounded MCP/skill/template recommendations
│  ├─ judge-rubric.md             ← pre-submission self-check (with weights)
│  ├─ pathways/
│  │  ├─ DECISION-BRIEF.md        ← decision record: why Safer Maternity Care
│  │  └─ 4-maternity.md           ← THE working spec (top source of truth)
│  └─ health/
│     ├─ SAFETY-GUARDRAILS.md     ← the health rules in detail
│     └─ NHS-RESOURCES.md         ← real, cited NHS/UK endpoints & helplines
└─ (app code added in Phase 2/3)
```

## 11. Sources of truth (precedence order)

1. `docs/pathways/4-maternity.md` (the locked pathway spec).
2. This `CLAUDE.md`.
3. `AGENTS.md` (code-owner contract).
4. `../hackathon/HACKATHON_PLAYBOOK.md` and `../hackathon/capability-router.md`
   (global control plane).

If these conflict, the higher item wins. Fix the lower one.
