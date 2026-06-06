# vigilant-winner · **Maternify**

Submission for **VibeHack London 2026** · Track: **Health Impact** (sponsor: Cursor).

**Safer Maternity Care** — a multilingual communication tool for minority-ethnic
pregnant women in the UK. Built in 24 hours, designed to be **live, usable,
evidenced, and safe**.

> *"ChatGPT gives information. **Maternify gives her a voice.**"*

Two flows. **Express:** a pregnant user describes a symptom in Mandarin or English;
Maternify checks for **pregnancy red-flags** (and on a red-flag bypasses the AI
entirely to a 999/triage emergency card), signals urgency, and gives her a
**clinically-grounded English script she can speak — or *play* (text-to-speech) —
to her midwife**. **Interpret:** she pastes an NHS letter and gets a plain-language
explanation, next steps, and the questions to ask. Not translation, not diagnosis —
**a voice.** MBRRACE-UK found 96% of reviewed maternal-death cases had a documented
interpreter need and only 27% had one; Black women are ~2.3–3× more likely to die
in pregnancy/childbirth than White women. Communication failure costs lives.

## Start here
- **[`CLAUDE.md`](CLAUDE.md)** — the operating contract. Read first.
- **[`docs/pathways/4-maternity.md`](docs/pathways/4-maternity.md)** — the Maternify working spec (top source of truth).
- **[`docs/health/SAFETY-GUARDRAILS.md`](docs/health/SAFETY-GUARDRAILS.md)** — the 5 hardcoded rules, red-flag lists, Zod schemas.
- **[`docs/BUILD-CHECKLIST.md`](docs/BUILD-CHECKLIST.md)** — the block-by-block build · **[`docs/SCOPE_MEMORY.md`](docs/SCOPE_MEMORY.md)** — the agent's self-learning log.
- **[`docs/DEMO-SCRIPT.md`](docs/DEMO-SCRIPT.md)** — pitch + 3 live scenarios · **[`docs/TECH-STACK.md`](docs/TECH-STACK.md)** — stack & API routes.
- **[`docs/TOOLS.md`](docs/TOOLS.md)** — which MCPs / skills to use, and when · **[`docs/SETUP.md`](docs/SETUP.md)** — run it locally (macOS/Linux).

## Stack
Next.js 14 + TypeScript + Tailwind · Claude Sonnet/Haiku (generation) · OpenAI
`text-embedding-3-small` + **in-memory RAG** over 12 NHS/Tommy's pages · OpenAI TTS
(English-script playback) · **Zod** on every output · Vercel. **No database, no
login** — no PII stored server-side.

## Principles (the short version)
- Live, working product — not a concept pitch.
- AI is the **core mechanic**, used responsibly.
- **No diagnosis. No reassurance** ("this is fine"). Communication, education, signposting.
- Pregnancy red-flag input **bypasses the AI** to a 999/triage emergency card — never reassured away.
- Every output is **Zod-validated** and cites a named NHS/Tommy's source.
- Crisis path always present. Privacy is a visible feature (nothing stored).

## Disclaimer
This project provides **support and information, not medical advice**, and is not a
substitute for a midwife, doctor, or maternity triage, and **not a professional
interpreter service**. **In an emergency, call 999. For urgent pregnancy concerns,
contact your maternity unit or call 111.**

---
*Repo: https://github.com/Abdulbosit-AiM/vigilant-winner*
