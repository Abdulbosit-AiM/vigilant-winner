# Health Safety Guardrails

The detail behind `CLAUDE.md` §7. This track (Health Impact) rewards **trust and
safety** above cleverness. These rules protect users *and* protect 40% of our
score (Appropriate AI Use 20% + Real-World Value 20%). They are non-negotiable.

Reconciled to the **Maternify PRD v0.2** safety spec on 6 June 2026
(`docs/RECONCILE-2026-06-06.md`). The headline below is the **5 hardcoded rules**;
sections 1–8 are the detail; the appendices (red-flag term lists, emergency card,
Zod schemas, prompt-injection defence) are the build artefacts.

---

## 0. The 5 hardcoded rules — verbatim in every generation system prompt

> **Do not paraphrase. Do not abbreviate. These ship in the system prompt of every
> generation call (GLM and Gemini alike) exactly as written.**

```
SAFETY RULES — ENFORCE ON EVERY OUTPUT:

1. NEVER produce a diagnostic conclusion. You may describe what a symptom may indicate
   and recommend a clinical action. You may not state what the user has or does not have.

2. NEVER say "this is fine", "don't worry", "you're probably okay", or any equivalent
   reassurance. When symptoms appear benign, say: "Your midwife will be able to
   reassure you after a check."

3. NEVER generate a response if the input contains any red-flag term from the hardcoded
   list. Red-flag detection runs BEFORE this prompt. If you receive a red-flag input,
   something has gone wrong in the pipeline — return: {"error": "red_flag_bypass_failed"}

4. EVERY clinical claim must cite its NHS or Tommy's source by name in the output JSON.
   The citation field must not be empty or null. If you cannot ground a claim in the
   indexed sources, say: "I couldn't find specific NHS guidance on this — please ask
   your midwife directly."

5. EVERY output must end with this exact string:
   "This is not medical advice. Always confirm with your midwife or doctor."
   It must appear as a separate field in the output JSON and be displayed prominently in
   the UI. It cannot be removed or hidden.
```

**Safety is structural, not aspirational.** The red-flag gate runs before the model;
Zod validates every output; the system prompt is never concatenated with user input.
These five rules are the answer to any safety question a judge asks — know them.

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
- The exact string (rule 5): **"This is not medical advice. Always confirm with your
  midwife or doctor."** — a separate field on every output, shown without scrolling.
- "In an emergency, call 999." · "Not a professional interpreter service" (footer).
- State plainly what the tool does and does not do.

## 5. Privacy by default — and make it visible

The hackathon build stores **no PII server-side** and has **no auth, no login**
(in-memory RAG; Supabase holds only public corpus text + anonymous events).
Privacy here is "we don't keep anything about you," shown plainly.

- **Minimal capture:** collect only what the flow needs; nothing persisted.
- **Explicit notice:** tell the user, in plain words, that her input is not stored.
- **Never log user input server-side — even in development.** Medical context is
  sensitive even without PII. **No `console.log(userInput)` anywhere.**
- **Prompt-injection safe:** user input is a `role: 'user'` turn only, never
  interpolated into the system prompt (see Appendix C).
- **No PII to third parties** without a clear, on-screen boundary. Prefer
  redaction/abstraction before sending context to any external model.
- **No secrets in client code, logs, or prompts.** Keys in `.env.local` only.
- Showing the privacy boundary in the UI is itself worth marks ("Real-World Value").

> Production (post-hackathon) reintroduces storage with NHS DSPT, a privacy notice,
> and per-user isolation (e.g. Postgres + RLS). See `docs/health/COMPLIANCE.md`.

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
      "bad headache and blurry vision", "bleeding", and the Mandarin equivalents
      "胎动减少" / "严重头痛" / "阴道出血") and shows the static emergency card —
      **bypassing the LLM** — never reassured away.
- [ ] Crisis path (self-harm/abuse) fires on a test input and shows real resources.
- [ ] No output asserts a diagnosis (test with an obvious symptom prompt).
- [ ] No output reassures ("this is fine" / "don't worry") — test a benign prompt.
- [ ] **Every output passes Zod validation; no raw LLM text reaches the client.**
- [ ] All clinical claims cite a named NHS/Tommy's source; disclaimer string present.
- [ ] Disclaimers visible on the main screen; storage notice ("not stored") visible.
- [ ] No PII logged server-side; no `console.log(userInput)`.
- [ ] Any mocked call is labelled as mocked in the demo.

---

## Appendix A — Red-flag list (hardcoded — `lib/redFlags.ts`)

Detection runs on raw user input **before any LLM call**. String matching + simple
regex. Not AI-evaluated. Source for the clinical content: `docs/RAG-CORPUS.md` (NHS
"Your baby's movements", "Pre-eclampsia", "Vaginal bleeding in pregnancy").

```typescript
const RED_FLAG_TERMS_EN = [
  // Fetal movement
  'reduced fetal movement', 'reduced foetal movement', 'baby not moving',
  "baby hasn't moved", 'no fetal movement', 'no foetal movement',
  'fetal movements reduced', 'foetal movements reduced',
  // Pre-eclampsia
  'severe headache', 'bad headache', 'vision changes', 'blurry vision',
  'seeing spots', 'visual disturbance', 'severe swelling', 'swollen face',
  'pain under ribs', 'epigastric pain',
  // Bleeding
  'heavy bleeding', 'heavy vaginal bleeding', 'blood clots', 'soaking a pad',
  // Waters
  'waters broken', 'waters breaking', 'waters broke', 'gush of fluid',
  'leaking fluid', 'rupture of membranes',
  // Other emergencies
  'chest pain', "can't breathe", 'difficulty breathing', 'unconscious',
  'fitting', 'seizure', 'collapse',
]

const RED_FLAG_TERMS_ZH = [
  '胎动减少', '宝宝不动', '没有胎动', '胎儿不动',          // Fetal movement
  '严重头痛', '剧烈头痛', '视力模糊', '视觉变化', '眼前发黑', // Pre-eclampsia
  '大量出血', '阴道出血', '破水', '羊水流出', '液体流出',     // Bleeding / waters
  '胸痛', '呼吸困难', '晕倒', '抽搐',                      // Other
]

// Hindi, Urdu and Polish lists mirror the same clinical categories
// (fetal movement, pre-eclampsia, bleeding, waters, other emergencies) —
// full lists live in lib/redFlags.ts (RED_FLAG_TERMS_HI / _UR / _PL).
// Polish matching also runs a diacritic-folded pass ("bol glowy" matches
// "ból głowy") — see lib/urgencyGate.ts.
```

> Mandarin matching has edge cases — full-width punctuation, simplified vs
> traditional variants. Test the gate with Chinese strings before wiring Express.
>
> ⚠ The Hindi, Urdu and Polish term lists and emergency-card copy are
> good-faith translations added 7 June 2026 — **verify with native speakers
> before claiming clinical coverage in those languages.** The gate checks every
> language list on every input, so adding a language only ever ADDS detection.

---

## Appendix B — Emergency card (static, no LLM — `EmergencyCard.tsx`)

```typescript
// lib/emergencyCard.ts — static constants, no model text.
// Copy ships for every supported language; the card shows English plus the
// user's selected language (Record<NativeLang, …> makes a missing language a
// compile error, not a silent gap).
const EMERGENCY_CARD = {
  type: 'emergency',
  en: {
    headline: 'Call 999 or go to A&E now',
    body: 'Your symptoms need urgent medical attention.',
    maternity_note: '… call your maternity unit or triage line now …',
    primary_label: 'Call 999',
    secondary_label: 'Or call NHS 111',
  },
  native: { zh: {…}, hi: {…}, ur: {…}, pl: {…} },   // same five fields each
  primary_tel: 'tel:999',
  secondary_tel: 'tel:111',
  disclaimer: 'This is not medical advice. Always confirm with your midwife or doctor.',
}
```

For an urgent pregnancy concern the primary instruction is always: contact your
**maternity unit / triage** now (number on the user's maternity notes), or 999 if
emergency. Full-screen, red background, single CTA, no other content. **No
generation, no caveats.**

---

## Appendix C — Output schemas (Zod — enforced on every API response)

```typescript
import { z } from 'zod'

export const ExpressOutputSchema = z.object({
  urgency: z.enum(['immediate', 'today', 'next_appointment']),
  urgency_label: z.string(),
  explanation_native: z.string(),
  explanation_source: z.string().min(1),                 // must not be empty
  english_script: z.string(),
  contact_type: z.enum(['999', '111', 'maternity_triage', 'midwife_team']),
  contact_label: z.string(),
  disclaimer: z.literal('This is not medical advice. Always confirm with your midwife or doctor.'),
})

export const InterpretOutputSchema = z.object({
  document_type: z.string(),
  explanation_native: z.string(),
  explanation_en: z.string(),
  explanation_source: z.string().min(1),
  next_steps: z.array(z.string()).min(1).max(4),
  questions_en: z.array(z.string()).min(2).max(4),
  disclaimer: z.literal('This is not medical advice. Always confirm with your midwife or doctor.'),
})
```

If Claude's response fails validation: **return a safe fallback, never raw LLM
text.** Write the schema **before** the prompt — the prompt is engineered to satisfy
the schema (`docs/SCOPE_MEMORY.md` pre-build decision).

---

## Appendix D — Prompt-injection defence

```typescript
// SAFE — system prompt hardcoded; user input is a separate turn
const messages = [
  { role: 'system', content: SYSTEM_PROMPT },   // hardcoded server-side
  { role: 'user',   content: userInput },        // never interpolated into system
]

// UNSAFE — never do this
const messages = [
  { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser said: ${userInput}` },
]
```

Render all model output via React (escaped by default). **`dangerouslySetInnerHTML`
is banned.** Rate-limit `/api/express` and `/api/interpret` (≈10 req/min per IP).
Full security notes: `docs/health/COMPLIANCE.md` and `docs/TECH-STACK.md`.

---

## Regulatory position (summary — full detail in `docs/health/COMPLIANCE.md`)

- **Class 0 / not a medical device** under UK MDR 2002. Positioned as a health
  information and communication tool — *not* a professional interpreter service
  (must appear in UI footer + any terms).
- The mandatory disclaimer + "always confirm with your midwife" framing keeps the
  product below the device-classification line.
- Hackathon build: no PII stored server-side; RAG corpus is publicly available
  NHS/Tommy's content (no copyright risk for the demo).
