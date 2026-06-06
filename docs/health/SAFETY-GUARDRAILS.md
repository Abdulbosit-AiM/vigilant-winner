# Health Safety Guardrails

The detail behind `CLAUDE.md` §7. This track (Health Impact) rewards **trust and
safety** above cleverness. These rules protect users *and* protect 40% of our
score (Appropriate AI Use 20% + Real-World Value 20%). They are non-negotiable.

---

## 1. No diagnosis, ever

- The product **must not state or imply a diagnosis** or a treatment decision.
- Allowed framings: *support, triage (urgency signalling), education, organising
  information, signposting to real services.*
- Banned phrasings: "you have…", "this is [condition]", "you should take…",
  "stop taking…", "you don't need to see a doctor".
- Preferred phrasings: "this may be worth discussing with…", "the NHS suggests…",
  "based on what you've shared, this looks like it could be [urgency level] — here's
  who can help".

## 2. No invented medical facts

- Every clinical statement must trace to a **cited source**: NHS.uk, NICE, NHS
  England, ONS, or peer-reviewed literature (PubMed). See `NHS-RESOURCES.md`.
- If the model is uncertain, it **says so** and signposts rather than guessing.
- Never invent a service name, phone number, URL, dose, or statistic. If we don't
  have a verified resource, we say "I'm not able to verify that — here's how to
  find official information."

## 3. Crisis / red-flag path — always present, always wins

Detect signals of acute risk and **break the normal flow immediately**:
- **Pregnancy red-flags — the highest-stakes path in this product:** reduced or
  changed fetal movement, severe headache or visual disturbance, vaginal bleeding,
  severe abdominal pain, waters breaking before 37 weeks, fever, sudden severe
  swelling. Escalate to maternity triage / 111 / 999. **Never reassure away a
  red-flag** — "it's probably nothing" is the exact failure mode MBRRACE-UK
  documents.
- Self-harm, suicidal ideation, intent or plan (incl. perinatal mental health).
- Abuse, domestic violence, safeguarding concerns.
- Acute medical emergency (e.g. chest pain, stroke signs, severe bleeding).

On detection:
1. Stop the normal triage/summary flow.
2. Show **real UK crisis resources** prominently (see list below).
3. Use calm, direct language. **Do not** do reflective listening that amplifies
   distress. Do not minimise. Do not ask repeated "safety assessment" questions.
4. Do not promise confidentiality or make claims about what authorities will do.

**UK crisis resources (verify before shipping — see `NHS-RESOURCES.md`):**
- Emergency: **999**
- **Urgent pregnancy concern: the user's maternity unit / triage line** (on her
  maternity notes) — the primary red-flag instruction
- NHS urgent help: **111** (mental health: 111 option 2 in most areas)
- Samaritans: **116 123** (free, 24/7)
- Shout crisis text line: text **85258**
- Maternal mental health: PANDAS **0808 1961 776**

## 4. Visible disclaimers

On screen, not buried in a footer or a ToS:
- "This is not medical advice and not a substitute for a qualified clinician."
- "In an emergency, call 999."
- State plainly what the tool does and does not do.

## 5. Privacy by default — and make it visible

- **Minimal capture:** collect only what the flow needs.
- **Explicit storage notice:** tell the user what is stored and where, in plain words.
- **Supabase RLS on every table.** A user can only ever read their own rows.
- **No PII to third parties** without a clear, on-screen boundary. Prefer
  redaction/abstraction before sending context to any external model.
- **No PII in logs.** No secrets in client code or prompts.
- Showing the privacy boundary in the UI is itself worth marks ("Real-World Value").

## 6. Honest mocking

- If any call is mocked for the demo (e.g. the AI response, an NHS lookup), the
  demo **states that it's mocked**. The judge rubric explicitly values "state what
  is real and what is mocked".

## 7. Design for vulnerable users

Our target user is often distressed, possibly low-literacy or a non-native English
speaker, and — per the evidence base — used to **not being heard** by services.
Tone must empower her voice (advocacy), never lecture or dismiss.
- Plain language (aim for reading age ~9–11). Run `design:ux-copy`.
- Large touch targets, high contrast. Run `design:accessibility-review` (WCAG 2.1 AA).
- No dark patterns, no urgency manipulation, no guilt.
- Offer a way to slow down, go back, or reach a human.

## 8. Escalation rule

When any health-safety judgement is unclear, **escalate to the human owner**. Do
not ship the guess. A safe "I can't help with that, here's who can" beats a
confident wrong answer.

---

### Pre-demo safety checklist
- [ ] Pregnancy red-flag path fires on test inputs ("baby is moving less",
      "bad headache and blurry vision", "bleeding") and shows real resources —
      and is never reassured away.
- [ ] Crisis path (self-harm/abuse) fires on a test input and shows real resources.
- [ ] No output asserts a diagnosis (test with an obvious symptom prompt).
- [ ] All clinical claims cite a source.
- [ ] Disclaimers visible on the main screen.
- [ ] Storage notice visible; RLS verified; no PII in logs.
- [ ] Any mocked call is labelled as mocked in the demo.
