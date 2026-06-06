# Maternify — Demo Script
**Hackathon pitch · Target: 3 min demo + 2 min Q&A**

---

## Pitch Narrative (Spoken — ~90 seconds)

> "Every year in the UK, women die in childbirth from causes that are preventable.
> MBRRACE-UK — the national maternal mortality review — found that 96% of cases reviewed had a documented need for an interpreter. Only 27% of those women had one.
>
> This is not a translation problem. It is a communication failure — and it costs lives.
>
> Minority ethnic women, many of them born outside the UK, leave appointments not understanding what was decided. They receive NHS letters they cannot decode. And when they feel something is wrong, they don't know how to say it in English — or they're afraid to say it at all.
>
> ChatGPT gives information. Maternify gives her a voice.
>
> Two flows. Express: she tells us how she feels. We give her an English script she can speak — or play — to her clinician. Interpret: she pastes an NHS letter. We tell her what it means, what to do next, and what to ask.
>
> Every output is grounded in NHS and Tommy's clinical guidance. Every output ends with a clear source citation and a reminder to confirm with her midwife. We do not diagnose. We do not replace. We bridge."

---

## Live Demo (3 scenarios — ~90 seconds)

**Pre-load all inputs before going live. No typing during demo.**

---

### Scenario 1 — Express: Non-Urgent (60 seconds)

**Setup:** Maya is 34 weeks pregnant. She types in Mandarin.

**Input to paste:**
```
我的宝宝今天动得很少，我有点担心。我现在34周了。
```
*(Translation: My baby hasn't moved much today, I'm a bit worried. I'm 34 weeks.)*

**Expected output:**
- Urgency: 🟡 Today — Contact your midwife team today
- Explanation (Mandarin): reduced fetal movement after 28 weeks — midwife should check, usually fine
- English script: "Hi, I'm calling because I've noticed my baby's movements seem reduced today. I'm 34 weeks pregnant. My name is [name]. I'd like to come in to be checked."
- Contact: Midwife team (with fallback to Maternity Triage)
- **Play button → judges hear the audio**

**Pitch beat:** "This is not translation. The system preserved her clinical concern — reduced fetal movement — from a natural Mandarin expression and generated a clear, confident English script she can play directly to her midwife."

---

### Scenario 2 — Interpret: Screening Result (45 seconds)

**Setup:** Maya has received her first-trimester screening result letter.

**Input to paste:**
```
Dear Patient,

Your combined first-trimester screening result for Down's syndrome (trisomy 21), Edwards' syndrome (trisomy 18), and Patau's syndrome (trisomy 13) is as follows:

Down's syndrome: 1 in 85 — HIGHER CHANCE
Edwards' and Patau's syndromes: 1 in 10,000 — LOWER CHANCE

You have been referred to the Fetal Medicine Unit for further discussion of your options. Please call [number] to book your appointment.

NHS Screening Programmes
```

**Expected output:**
- Document type: First-trimester combined screening result
- Explanation (Mandarin + English): "This is a screening result, not a diagnosis. 1 in 85 means that out of 100 pregnancies with the same factors, approximately 1 baby would have Down's syndrome. The NHS will offer you further tests."
- Next steps: Call Fetal Medicine Unit → ask about NIPT vs amniocentesis → not required to decide immediately
- Questions to ask: "Can you explain the difference between the NIPT test and amniocentesis?" "What are the risks?" "How long will results take?"

**Pitch beat:** "She received this letter and didn't sleep for two nights. She didn't know if 1 in 85 was good or bad. Maternify told her what it means — and gave her the words to ask the right questions."

---

### Scenario 3 — Red Flag Emergency Card (15 seconds)

**Setup:** Staged. Type or paste a red-flag symptom.

**Input:**
```
I have a very bad headache and my vision is blurry
```

**Expected output:** Full-screen emergency card (red background, large text):
- **Call 999 or go to A&E immediately**
- "These symptoms can be signs of pre-eclampsia, which needs urgent medical attention."
- One-tap tel:999 button
- No explanation. No caveats. No LLM generation.

**Pitch beat:** "On a red flag, we don't generate. We don't explain. We act. The system bypasses all AI and delivers one message: call now."

---

## Anticipated Judge Questions

**Q: Why not use LanguageLine?**
> "LanguageLine is excellent — but it's pre-booked, not available at 10pm when she notices something feels wrong, and not present when she's reading a letter alone at home. Maternify covers the gaps."

**Q: Isn't this dangerous — what if the AI gets it wrong?**
> "Three answers. One: every clinical output is RAG-grounded in named NHS sources — not free generation. Two: the system never says 'this is fine' — it always directs to a clinician. Three: red flags bypass AI entirely. We designed conservatively. When uncertain, we say so and send her to her midwife."

**Q: Could you just use ChatGPT for this?**
> "ChatGPT has no urgency classifier, no NHS grounding, no TTS playback, and its outputs vary by prompt. We tried it. It told a test user 'this sounds like Braxton Hicks — don't worry.' That's not safe. We hardcode the safety boundaries."

**Q: What about other languages?**
> "Whisper handles 90+ languages. We chose Mandarin for the hackathon because it has the highest representation in our priority population and the sharpest metaphor/clinical-term gap. Urdu and Bengali are the next two — the architecture supports it in v1."

---

## Fallback Plan

If live demo breaks:
1. Screen recording of both flows (pre-record before pitch day)
2. Walk through static screenshots of each output state
3. Never skip the TTS moment — play the pre-recorded audio even if the live demo is down

**Demo driver:** ONE person. Agreed before pitch day. No handoffs.
