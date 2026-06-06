# Maternify — RAG Corpus
**12 curated sources · Index at build time · Verify URLs before scraping**

---

## Indexing Rules

- Fetch at build time only — no runtime fetching
- Chunk size: 400 tokens, 50-token overlap
- Embed: `text-embedding-3-small` (OpenAI)
- Store: in-memory (no external vector DB for hackathon)
- Label each chunk with: `source_name`, `source_url`, `topic`
- Every RAG retrieval must surface `source_name` for inline citation

---

## Corpus (12 sources)

### Red-Flag / Emergency Symptoms

| # | Topic | Source | Justification |
|---|-------|--------|--------------|
| 1 | Reduced / absent fetal movements | Tommy's — "Your baby's movements" | Most common Express query; clear red-flag guidance |
| 2 | Pre-eclampsia symptoms | NHS — "Pre-eclampsia" | Signs of pre-eclampsia (headache, vision, swelling) must be grounded |
| 3 | Pregnancy warning signs (full list) | Tommy's — "Pregnancy warning signs" | Comprehensive; used as primary red-flag reference |

**URLs (verify before scraping):**
- `https://www.tommys.org/pregnancy-information/im-pregnant/your-babys-movements`
- `https://www.nhs.uk/conditions/pre-eclampsia/`
- `https://www.tommys.org/pregnancy-information/pregnancy-complications/pregnancy-warning-signs`

---

### Antenatal Appointments & Pathway

| # | Topic | Source | Justification |
|---|-------|--------|--------------|
| 4 | Antenatal care overview | NHS — "Your antenatal appointments" | Explains pathway; used when Maya doesn't understand why she's been booked |
| 5 | 12-week scan | NHS — "Your 12-week scan" | Most common early appointment confusion |
| 6 | 20-week anomaly scan | NHS — "Your mid-pregnancy (20-week) scan" | Scan results are a primary Interpret use case |

**URLs (verify before scraping):**
- `https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/`
- `https://www.nhs.uk/pregnancy/your-pregnancy-care/12-week-scan/`
- `https://www.nhs.uk/pregnancy/your-pregnancy-care/20-week-scan/`

---

### Screening & Test Results (Primary Interpret Corpus)

| # | Topic | Source | Justification |
|---|-------|--------|--------------|
| 7 | Down's / Edwards' / Patau's screening | NHS — "Screening for Down's, Edwards' and Patau's syndromes" | 1-in-X results are the most anxiety-inducing letters Maya receives |
| 8 | Blood tests in pregnancy | NHS — "Blood tests in pregnancy" | Common blood result summaries; gestational diabetes, anaemia |
| 9 | Gestational diabetes | NHS — "Gestational diabetes" | Common diagnosis; dense clinical language in letters |

**URLs (verify before scraping):**
- `https://www.nhs.uk/pregnancy/your-pregnancy-care/screening-for-downs-edwards-and-pataus-syndromes/`
- `https://www.nhs.uk/pregnancy/your-pregnancy-care/blood-tests/`
- `https://www.nhs.uk/conditions/gestational-diabetes/`

---

### Labour, Birth & Postnatal

| # | Topic | Source | Justification |
|---|-------|--------|--------------|
| 10 | Signs of labour | NHS — "Signs of labour" | Common Express query in third trimester |
| 11 | Postnatal care | NHS — "Your postnatal care" | Postnatal letters and check-in instructions |

**URLs (verify before scraping):**
- `https://www.nhs.uk/pregnancy/labour-and-birth/signs-of-labour/`
- `https://www.nhs.uk/conditions/baby/support-and-services/postnatal-care/`

---

### NHS Navigation

| # | Topic | Source | Justification |
|---|-------|--------|--------------|
| 12 | How to self-refer to a midwife | NHS Start for Life — "How to get antenatal care" | Critical: many minority ethnic women don't know self-referral is possible without GP |

**URL (verify before scraping):**
- `https://www.nhs.uk/start-for-life/pregnancy/getting-antenatal-care/`

---

## What NOT to index

- Wikipedia, general health blogs, BabyCenter, Mumsnet — unverifiable clinical claims
- MBRRACE-UK PDFs — not publicly scrapable; use statistics in PRD pitch only, not RAG
- Full NICE guidelines — too long, too dense; use NHS patient-facing summaries only
- Tommy's donation/campaign pages — off-topic content pollutes retrieval

---

## Fallback Rule

If RAG retrieval returns no relevant chunk (similarity < threshold):
- Do NOT generate a clinical answer from model knowledge alone
- Return: "I couldn't find specific NHS guidance on this. Please contact your midwife team directly or call NHS 111."
- Never hallucinate a source citation
