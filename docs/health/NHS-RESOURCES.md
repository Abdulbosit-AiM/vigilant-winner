# NHS & UK Health Resources — verified references (Safer Maternity Care)

Real, citable endpoints, datasets, and helplines for grounding the product. **Do
not invent resources.** If something here is stale at build time, re-verify before
shipping (the NHS is migrating some APIs in Spring 2026 — see note).

> ⚠️ **Verify keys/availability during the build.** Some APIs need a (free) trial
> subscription key. The crisis numbers must be confirmed correct for the user's
> region before demo.

---

## 1. Developer APIs (real, called from app code — not MCPs)

### Service Search API (organisations) — **core for this pathway**
- Find NHS organisations/services (GPs, pharmacies, **maternity units**, specialist
  services). JSON over HTTP.
- Docs: https://developer.api.nhs.uk/nhs-api/documentation/service-search-organisations
- Portal: https://developer.api.nhs.uk/nhs-api
- **Use for:** the signposting step of the core flow — point the user to a real
  local maternity service, never an invented one.

### NHS Website Content API
- Pull official NHS.uk content: Health A–Z, pregnancy content, conditions.
- Free. Trial: ~10 calls/min, up to 1,000 calls/month. Full: up to 4,000 calls/hour.
- Requires a `subscription-key` header (register on the NHS developer hub).
- Catalogue: https://digital.nhs.uk/developer/api-catalogue/nhs-website-content
- v2: https://digital.nhs.uk/developer/api-catalogue/nhs-website-content/v2
- Specs (GitHub): https://github.com/NHSDigital/nhs-website-content-api
- **Use for:** grounding plain-language explanations and red-flag copy in
  authoritative NHS pregnancy content (e.g. the NHS pages on reduced fetal
  movement, pre-eclampsia symptoms, bleeding in pregnancy).

> **Migration note:** NHS website syndication APIs/widgets are moving to the NHS
> Developer & integration hub; the older site is being retired in **Spring 2026**.
> Confirm the live base URL at build time. NHS API catalogue (all APIs):
> https://digital.nhs.uk/developer/api-catalogue

### Directory of Services (DoS) API suite
- Deeper service directory used by 111/urgent care. https://developer.nhs.uk/apis/dos-api/
- Likely heavier than a 24h build needs; note for completeness.

---

## 2. Key NHS pregnancy content to ground red-flag logic (verify at build time)

> The full **12-source RAG corpus** (the exact pages to index, with justifications
> and indexing rules) is in **`docs/RAG-CORPUS.md`**. The pages below are the
> red-flag subset.

The red-flag checker's clinical content must trace to pages like these — never to
model memory:
- NHS — Your baby's movements: https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/
- NHS — Pre-eclampsia (severe headache, vision changes, swelling): https://www.nhs.uk/conditions/pre-eclampsia/
- NHS — Vaginal bleeding in pregnancy: https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/vaginal-bleeding/
- NHS — Pregnancy week-by-week / when to get urgent help hub: https://www.nhs.uk/pregnancy/

---

## 3. Crisis & support helplines (UK) — confirm before demo

| Need | Service | Contact |
| --- | --- | --- |
| Life-threatening emergency | Emergency services | **999** |
| Urgent (non-emergency) medical | NHS | **111** |
| Urgent pregnancy concern | **Local maternity triage / labour ward** (number on the user's maternity notes) | surface prominently in red-flag flow |
| Urgent mental health | NHS 111 mental health option | **111, option 2** (most areas) |
| Maternal mental health | PANDAS Foundation | **0808 1961 776** |
| Pregnancy & baby loss / concerns about baby's movements | Tommy's midwife line | **0800 014 7800** |
| Emotional crisis, 24/7 | Samaritans | **116 123** (free) |
| Crisis by text | Shout | text **85258** |
| Domestic abuse | National DA Helpline (Refuge) | **0808 2000 247** |
| Birth rights & advocacy | Birthrights advice service | https://birthrights.org.uk/factsheets/ |

> These are widely published UK numbers. **Re-verify each before the demo** — do not
> rely on this table alone for the shipped product. For red-flags, the primary
> instruction is always: contact your maternity unit/triage **now**, or 999 if
> emergency.

---

## 4. Evidence sources (for grounding claims)

- **MBRRACE-UK** (maternal mortality & disparities — our core evidence): via NPEU /
  https://www.npeu.ox.ac.uk/mbrrace-uk
- Birthrights MBRRACE summary (2025): https://birthrights.org.uk/2025/09/11/no-improvement-in-maternal-death-rates-or-racial-inequalities-finds-latest-mbrrace-report/
- GOV.UK ethnic-minority maternity engagement: https://www.gov.uk/government/publications/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff/confidence-in-maternity-care-services-engagement-with-ethnic-minority-women-and-maternity-staff
- Black Maternal Health report (Commons Health & Social Care Committee):
  https://publications.parliament.uk/pa/cm5901/cmselect/cmhealth/895/report.html
- **NICE** guidance (antenatal care NG201; hypertension in pregnancy NG133):
  https://www.nice.org.uk
- **NHS Digital / NHS England** statistics: https://digital.nhs.uk/data-and-information
- **ONS** (population health): https://www.ons.gov.uk
- **PubMed** (MCP 🔌, connect when needed) for peer-reviewed backing.

---

## Citations (verified June 2026)
- NHS Website Content API — https://digital.nhs.uk/developer/api-catalogue/nhs-website-content
- NHS Website Content API v2 — https://digital.nhs.uk/developer/api-catalogue/nhs-website-content/v2
- NHS website content API specs — https://github.com/NHSDigital/nhs-website-content-api
- Service Search API — https://developer.api.nhs.uk/nhs-api/documentation/service-search-organisations
- NHS API catalogue — https://digital.nhs.uk/developer/api-catalogue
- Directory of Services API — https://developer.nhs.uk/apis/dos-api/
- MBRRACE-UK (NPEU) — https://www.npeu.ox.ac.uk/mbrrace-uk
